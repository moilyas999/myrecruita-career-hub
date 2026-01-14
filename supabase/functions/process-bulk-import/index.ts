/**
 * Process Bulk Import Edge Function
 * 
 * Processes uploaded CV files in background, parsing each with AI
 * and importing into cv_submissions table.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createSupabaseClient } from '../_shared/file-handler.ts';
import { parseCV } from '../_shared/cv-parser.ts';
import type { BulkImportSession, BulkImportFile } from '../_shared/types.ts';

interface ProcessRequest {
  session_id: string;
  retry_failed?: boolean;
  file_ids?: string[];
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { session_id, retry_failed = false, file_ids = [] }: ProcessRequest = await req.json();
    
    if (!session_id) {
      return errorResponse('session_id is required', 400);
    }

    const supabase = createSupabaseClient();

    // Verify the session exists
    const { data: session, error: sessionError } = await supabase
      .from('bulk_import_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return errorResponse('Session not found', 404);
    }

    // Respond immediately, process in background
    const response = jsonResponse({ 
      success: true, 
      message: 'Background processing started',
      session_id 
    });

    // Background processing function
    const processFiles = async () => {
      try {
        // Update session status
        const statusUpdate = retry_failed || file_ids.length > 0
          ? { status: 'processing', completed_at: null, error_message: null }
          : { status: 'processing', started_at: new Date().toISOString() };

        await supabase
          .from('bulk_import_sessions')
          .update(statusUpdate)
          .eq('id', session_id);

        // Get files to process based on mode
        let filesQuery = supabase
          .from('bulk_import_files')
          .select('*')
          .eq('session_id', session_id);
        
        if (file_ids.length > 0) {
          filesQuery = filesQuery.in('id', file_ids);
        } else if (retry_failed) {
          filesQuery = filesQuery.eq('status', 'error');
        } else {
          filesQuery = filesQuery.eq('status', 'pending');
        }
        
        const { data: files, error: filesError } = await filesQuery;

        if (filesError) {
          throw new Error(`Failed to fetch files: ${filesError.message}`);
        }

        if (!files || files.length === 0) {
          await supabase
            .from('bulk_import_sessions')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', session_id);
          return;
        }

        let parsedCount = (session as BulkImportSession).parsed_count || 0;
        let importedCount = (session as BulkImportSession).imported_count || 0;
        let failedCount = (session as BulkImportSession).failed_count || 0;

        for (const file of files as BulkImportFile[]) {
          try {
            // Update file status to parsing
            await supabase
              .from('bulk_import_files')
              .update({ status: 'parsing' })
              .eq('id', file.id);

            // Parse the CV using shared parser
            const result = await parseCV(supabase, file.file_path, { bucket: 'cv-uploads' });

            if (!result.success) {
              throw new Error(result.error);
            }

            const parsedData = result.data;

            // Update file with parsed data
            await supabase
              .from('bulk_import_files')
              .update({ 
                status: 'parsed',
                parsed_data: parsedData,
                processed_at: new Date().toISOString()
              })
              .eq('id', file.id);

            parsedCount++;

            // Import to cv_submissions
            await supabase
              .from('bulk_import_files')
              .update({ status: 'importing' })
              .eq('id', file.id);

            const { data: cvSubmission, error: insertError } = await supabase
              .from('cv_submissions')
              .insert({
                name: parsedData.name,
                email: parsedData.email,
                phone: parsedData.phone,
                job_title: parsedData.job_title,
                sector: parsedData.sector,
                location: parsedData.location,
                cv_file_url: file.file_url,
                skills: parsedData.skills,
                experience_summary: parsedData.experience_summary,
                years_experience: parsedData.years_experience,
                education_level: parsedData.education_level,
                seniority_level: parsedData.seniority_level,
                ai_profile: parsedData.ai_profile,
                cv_score: parsedData.cv_score,
                cv_score_breakdown: parsedData.cv_score_breakdown,
                scored_at: new Date().toISOString(),
                source: 'admin_bulk_background',
                added_by: (session as BulkImportSession).user_id
              })
              .select()
              .single();

            if (insertError) {
              throw new Error(`Failed to insert CV: ${insertError.message}`);
            }

            // Update file as imported
            await supabase
              .from('bulk_import_files')
              .update({ 
                status: 'imported',
                cv_submission_id: cvSubmission.id,
                processed_at: new Date().toISOString()
              })
              .eq('id', file.id);

            importedCount++;

            // Update session progress
            await supabase
              .from('bulk_import_sessions')
              .update({ 
                parsed_count: parsedCount,
                imported_count: importedCount,
                failed_count: failedCount
              })
              .eq('id', session_id);

            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 1500));

          } catch (fileError: unknown) {
            console.error(`Error processing file ${file.file_name}:`, fileError);
            
            await supabase
              .from('bulk_import_files')
              .update({ 
                status: 'error',
                error_message: fileError instanceof Error ? fileError.message : 'Unknown error',
                processed_at: new Date().toISOString()
              })
              .eq('id', file.id);

            failedCount++;

            // Update session progress
            await supabase
              .from('bulk_import_sessions')
              .update({ 
                parsed_count: parsedCount,
                imported_count: importedCount,
                failed_count: failedCount
              })
              .eq('id', session_id);
          }
        }

        // Mark session as completed
        await supabase
          .from('bulk_import_sessions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            parsed_count: parsedCount,
            imported_count: importedCount,
            failed_count: failedCount
          })
          .eq('id', session_id);

      } catch (error: unknown) {
        console.error('Background processing error:', error);
        
        await supabase
          .from('bulk_import_sessions')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', session_id);
      }
    };

    // Start background processing
    (globalThis as any).EdgeRuntime?.waitUntil?.(processFiles()) ?? processFiles();

    return response;

  } catch (error: unknown) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
