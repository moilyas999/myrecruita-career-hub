/**
 * Rescore CVs Edge Function
 * 
 * Finds all unscored CV submissions and processes them in background
 * using the shared CV parser.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createSupabaseClient, extractStoragePath } from '../_shared/file-handler.ts';
import { parseCV } from '../_shared/cv-parser.ts';

interface CVSubmission {
  id: string;
  name: string;
  email: string;
  cv_file_url: string;
  job_title?: string;
  sector?: string;
  location?: string;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseClient();

    // Get all unscored CVs with file URLs
    const { data: unscoredCVs, error: queryError } = await supabase
      .from('cv_submissions')
      .select('id, name, email, cv_file_url, job_title, sector, location')
      .is('cv_score', null)
      .not('cv_file_url', 'is', null);

    if (queryError) {
      console.error('Query error:', queryError);
      return errorResponse(`Failed to fetch CVs: ${queryError.message}`, 500);
    }

    if (!unscoredCVs || unscoredCVs.length === 0) {
      return jsonResponse({ message: 'No unscored CVs found', count: 0 });
    }

    console.log(`Found ${unscoredCVs.length} unscored CVs to process`);

    // Background processing function
    const processAllCVs = async () => {
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < unscoredCVs.length; i++) {
        const cv = unscoredCVs[i] as CVSubmission;
        console.log(`Processing ${i + 1}/${unscoredCVs.length}: ${cv.name}`);

        try {
          // Extract file path from URL
          let filePath = cv.cv_file_url;
          const storageInfo = extractStoragePath(cv.cv_file_url);
          
          if (storageInfo) {
            filePath = storageInfo.path;
          } else if (filePath.includes('cv-uploads/')) {
            filePath = filePath.split('/cv-uploads/')[1].split('?')[0];
          }

          // Parse the CV
          const result = await parseCV(supabase, filePath, { bucket: 'cv-uploads' });

          if (!result.success) {
            console.error(`Failed to parse CV for ${cv.name}: ${result.error}`);
            failCount++;
            continue;
          }

          const data = result.data;

          // Update the CV submission with extracted data
          const { error: updateError } = await supabase
            .from('cv_submissions')
            .update({
              cv_score: data.cv_score,
              cv_score_breakdown: data.cv_score_breakdown,
              scored_at: new Date().toISOString(),
              // Only update fields that weren't already set
              ...(data.job_title && !cv.job_title ? { job_title: data.job_title } : {}),
              ...(data.sector && !cv.sector ? { sector: data.sector } : {}),
              ...(data.location && !cv.location ? { location: data.location } : {}),
              skills: data.skills,
              experience_summary: data.experience_summary,
              education_level: data.education_level,
              seniority_level: data.seniority_level,
              years_experience: data.years_experience,
              ai_profile: data.ai_profile
            })
            .eq('id', cv.id);

          if (updateError) {
            console.error(`Update error for ${cv.name}:`, updateError);
            failCount++;
            continue;
          }

          console.log(`Successfully scored ${cv.name}: ${data.cv_score}`);
          successCount++;

        } catch (error) {
          console.error(`Error processing CV for ${cv.name}:`, error);
          failCount++;
        }

        // Rate limiting delay
        if (i < unscoredCVs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      console.log(`Background CV scoring complete: ${successCount} success, ${failCount} failed`);
    };

    // Start background processing
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(processAllCVs());

    return jsonResponse({ 
      message: `Started re-scoring ${unscoredCVs.length} CVs in background`,
      count: unscoredCVs.length
    });

  } catch (error: unknown) {
    console.error('Error in rescore-cvs function:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
