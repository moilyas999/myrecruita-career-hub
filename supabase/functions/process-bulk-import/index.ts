import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the session exists
    const { data: session, error: sessionError } = await supabase
      .from('bulk_import_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Respond immediately, process in background
    const responsePromise = new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Background processing started',
        session_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

    // Use EdgeRuntime.waitUntil for background processing
    const processFiles = async () => {
      try {
        // Update session status to processing
        await supabase
          .from('bulk_import_sessions')
          .update({ 
            status: 'processing', 
            started_at: new Date().toISOString() 
          })
          .eq('id', session_id);

        // Get all pending files for this session
        const { data: files, error: filesError } = await supabase
          .from('bulk_import_files')
          .select('*')
          .eq('session_id', session_id)
          .eq('status', 'pending');

        if (filesError) {
          throw new Error(`Failed to fetch files: ${filesError.message}`);
        }

        if (!files || files.length === 0) {
          await supabase
            .from('bulk_import_sessions')
            .update({ 
              status: 'completed', 
              completed_at: new Date().toISOString() 
            })
            .eq('id', session_id);
          return;
        }

        let parsedCount = session.parsed_count || 0;
        let importedCount = session.imported_count || 0;
        let failedCount = session.failed_count || 0;

        for (const file of files) {
          try {
            // Update file status to parsing
            await supabase
              .from('bulk_import_files')
              .update({ status: 'parsing' })
              .eq('id', file.id);

            // Download file from storage
            const { data: fileData, error: downloadError } = await supabase.storage
              .from('cv-uploads')
              .download(file.file_path);

            if (downloadError) {
              throw new Error(`Failed to download file: ${downloadError.message}`);
            }

            // Convert to base64
            const arrayBuffer = await fileData.arrayBuffer();
            const base64 = btoa(
              new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            // Determine MIME type
            const extension = file.file_name.toLowerCase().split('.').pop();
            let mimeType = 'application/pdf';
            if (extension === 'docx') {
              mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            } else if (extension === 'doc') {
              mimeType = 'application/msword';
            }

            // Call AI to parse CV
            const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
            if (!lovableApiKey) {
              throw new Error('LOVABLE_API_KEY not configured');
            }

            const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-3-flash-preview',
                messages: [
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: `You are a CV/Resume parsing expert. Extract the following information from this document and return ONLY valid JSON:

{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "job_title": "Current or most recent job title",
  "sector": "Industry sector (choose from: Accountancy & Finance, Technology, Healthcare, Legal, Engineering, Marketing, Sales, HR, Operations, Other)",
  "location": "City/Location",
  "skills": "Comma-separated list of key skills",
  "experience_summary": "Brief 2-3 sentence summary of experience",
  "years_experience": number or null,
  "education_level": "Highest education (PhD, Masters, Bachelors, Diploma, High School, Other)",
  "seniority_level": "One of: Entry, Junior, Mid-Level, Senior, Lead, Manager, Director, Executive, C-Level",
  "ai_profile": {
    "hard_skills": ["list of technical skills"],
    "soft_skills": ["list of soft skills"],
    "certifications": ["list of certifications"],
    "industries": ["list of industries worked in"],
    "experience_years": number,
    "seniority": "seniority level",
    "education": {
      "level": "degree level",
      "field": "field of study",
      "institution": "school/university name"
    },
    "key_achievements": ["list of notable achievements"],
    "career_progression": "brief description of career growth",
    "ideal_roles": ["list of suitable job types"],
    "summary_for_matching": "2-3 sentence summary optimized for job matching"
  },
  "cv_score": number from 0-100 based on overall quality,
  "cv_score_breakdown": {
    "experience": number 0-100,
    "skills": number 0-100,
    "education": number 0-100,
    "presentation": number 0-100
  }
}

If any field cannot be determined, use null or empty array/string as appropriate.
Return ONLY the JSON object, no other text.`
                      },
                      {
                        type: 'image_url',
                        image_url: {
                          url: `data:${mimeType};base64,${base64}`
                        }
                      }
                    ]
                  }
                ]
              })
            });

            if (!aiResponse.ok) {
              const errorText = await aiResponse.text();
              throw new Error(`AI API error: ${errorText}`);
            }

            const aiResult = await aiResponse.json();
            const content = aiResult.choices?.[0]?.message?.content || '';
            
            // Parse the JSON response
            let parsedData;
            try {
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]);
              } else {
                throw new Error('No JSON found in response');
              }
            } catch (parseError) {
              throw new Error(`Failed to parse AI response: ${parseError.message}`);
            }

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

            // Now import to cv_submissions
            await supabase
              .from('bulk_import_files')
              .update({ status: 'importing' })
              .eq('id', file.id);

            const { data: cvSubmission, error: insertError } = await supabase
              .from('cv_submissions')
              .insert({
                name: parsedData.name || 'Unknown',
                email: parsedData.email || `unknown-${Date.now()}@placeholder.com`,
                phone: parsedData.phone || '',
                job_title: parsedData.job_title || null,
                sector: parsedData.sector || null,
                location: parsedData.location || null,
                cv_file_url: file.file_url,
                skills: parsedData.skills || null,
                experience_summary: parsedData.experience_summary || null,
                years_experience: parsedData.years_experience || null,
                education_level: parsedData.education_level || null,
                seniority_level: parsedData.seniority_level || null,
                ai_profile: parsedData.ai_profile || null,
                cv_score: parsedData.cv_score ? Math.round(parsedData.cv_score) : null,
                cv_score_breakdown: parsedData.cv_score_breakdown || null,
                scored_at: parsedData.cv_score ? new Date().toISOString() : null,
                source: 'admin_bulk_background',
                added_by: session.user_id
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

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

          } catch (fileError: any) {
            console.error(`Error processing file ${file.file_name}:`, fileError);
            
            await supabase
              .from('bulk_import_files')
              .update({ 
                status: 'error',
                error_message: fileError.message,
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

      } catch (error: any) {
        console.error('Background processing error:', error);
        
        await supabase
          .from('bulk_import_sessions')
          .update({ 
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', session_id);
      }
    };

    // Start background processing
    (globalThis as any).EdgeRuntime?.waitUntil?.(processFiles()) ?? processFiles();

    return responsePromise;

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
