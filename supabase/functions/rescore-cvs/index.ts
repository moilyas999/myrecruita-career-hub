import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CVSubmission {
  id: string;
  name: string;
  email: string;
  cv_file_url: string;
  job_title?: string;
  sector?: string;
  location?: string;
}

async function processCV(supabase: any, cv: CVSubmission): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    console.log(`Processing CV for: ${cv.name}`);
    
    // Extract file path from URL
    let filePath = cv.cv_file_url;
    if (filePath.includes('cv-uploads/')) {
      filePath = filePath.split('/cv-uploads/')[1];
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('cv-uploads')
      .download(filePath);

    if (downloadError) {
      console.error(`Failed to download CV for ${cv.name}:`, downloadError);
      return { success: false, error: `Download failed: ${downloadError.message}` };
    }

    // Determine file type
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    
    let requestBody: any;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      return { success: false, error: 'LOVABLE_API_KEY not configured' };
    }

    const systemPrompt = `You are an expert CV/Resume analyzer and career consultant. Your task is to:
1. Extract key information from the CV
2. Build a comprehensive AI profile for job matching
3. Score the CV quality on a 0-100 scale

Be thorough but concise. Focus on extracting actionable data for recruitment purposes.`;

    const userPrompt = `Analyze this CV and extract the following information:

REQUIRED FIELDS:
- name: Full name of the candidate
- email: Email address
- phone: Phone number
- job_title: Current or most recent job title
- sector: Industry/sector they work in
- location: Their location/city
- skills: Comma-separated list of key skills
- experience_summary: Brief 2-3 sentence summary of their experience
- education_level: Highest education (e.g., "Bachelor's Degree", "Master's Degree", "PhD", "High School")
- seniority_level: One of: "Entry Level", "Junior", "Mid-Level", "Senior", "Lead", "Manager", "Director", "Executive"
- years_experience: Estimated total years of professional experience (number)

AI PROFILE (for job matching):
- hard_skills: Array of technical/hard skills with proficiency levels
- soft_skills: Array of soft skills demonstrated
- certifications: Any certifications or qualifications mentioned
- industries: Industries they have experience in
- key_achievements: Notable accomplishments with metrics where possible
- career_progression: Brief description of their career trajectory
- ideal_roles: Types of roles they would be suited for
- summary_for_matching: 2-3 sentence summary optimized for job matching algorithms

CV QUALITY SCORE (0-100):
Score the CV based on these criteria (each out of ~16-17 points):
- completeness: Are all standard sections present? (contact, summary, experience, education, skills)
- skills_relevance: Are skills clearly listed and relevant to their field?
- experience_depth: Is work experience detailed with responsibilities and achievements?
- achievements: Are there quantifiable achievements and metrics?
- education: Is education clearly presented with relevant details?
- presentation: Is the CV well-structured, readable, and professional?

Provide a breakdown with scores for each criterion and an overall score.

Return ONLY valid JSON in this exact format:
{
  "name": "string",
  "email": "string", 
  "phone": "string",
  "job_title": "string",
  "sector": "string",
  "location": "string",
  "skills": "string (comma-separated)",
  "experience_summary": "string",
  "education_level": "string",
  "seniority_level": "string",
  "years_experience": number,
  "ai_profile": {
    "hard_skills": [{"skill": "string", "proficiency": "beginner|intermediate|advanced|expert"}],
    "soft_skills": ["string"],
    "certifications": ["string"],
    "industries": ["string"],
    "key_achievements": ["string"],
    "career_progression": "string",
    "ideal_roles": ["string"],
    "summary_for_matching": "string"
  },
  "cv_score": number,
  "cv_score_breakdown": {
    "completeness": {"score": number, "max": 17, "notes": "string"},
    "skills_relevance": {"score": number, "max": 17, "notes": "string"},
    "experience_depth": {"score": number, "max": 17, "notes": "string"},
    "achievements": {"score": number, "max": 16, "notes": "string"},
    "education": {"score": number, "max": 16, "notes": "string"},
    "presentation": {"score": number, "max": 17, "notes": "string"}
  }
}`;

    if (fileExtension === 'pdf') {
      // For PDFs, send as base64 for multimodal processing
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      requestBody = {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              { type: "text", text: userPrompt },
              { 
                type: "image_url", 
                image_url: { url: `data:application/pdf;base64,${base64}` }
              }
            ]
          }
        ],
        max_tokens: 4000,
      };
    } else if (fileExtension === 'docx') {
      // For DOCX, extract text first
      const textContent = await extractTextFromDocx(await fileData.arrayBuffer());
      
      requestBody = {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userPrompt}\n\nCV CONTENT:\n${textContent}` }
        ],
        max_tokens: 4000,
      };
    } else {
      return { success: false, error: `Unsupported file type: ${fileExtension}` };
    }

    // Call AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`AI API error for ${cv.name}:`, errorText);
      return { success: false, error: `AI API error: ${aiResponse.status}` };
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      return { success: false, error: 'No content in AI response' };
    }

    // Parse the JSON response
    let extracted;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      } else {
        return { success: false, error: 'No valid JSON in AI response' };
      }
    } catch (parseError) {
      console.error(`JSON parse error for ${cv.name}:`, parseError);
      return { success: false, error: 'Failed to parse AI response' };
    }

    // Update the CV submission
    const { error: updateError } = await supabase
      .from('cv_submissions')
      .update({
        cv_score: extracted.cv_score || null,
        cv_score_breakdown: extracted.cv_score_breakdown || null,
        scored_at: new Date().toISOString(),
        ...(extracted.job_title && !cv.job_title ? { job_title: extracted.job_title } : {}),
        ...(extracted.sector && !cv.sector ? { sector: extracted.sector } : {}),
        ...(extracted.location && !cv.location ? { location: extracted.location } : {}),
        ...(extracted.skills ? { skills: extracted.skills } : {}),
        ...(extracted.experience_summary ? { experience_summary: extracted.experience_summary } : {}),
        ...(extracted.education_level ? { education_level: extracted.education_level } : {}),
        ...(extracted.seniority_level ? { seniority_level: extracted.seniority_level } : {}),
        ...(extracted.years_experience ? { years_experience: extracted.years_experience } : {}),
        ...(extracted.ai_profile ? { ai_profile: extracted.ai_profile } : {}),
      })
      .eq('id', cv.id);

    if (updateError) {
      console.error(`Update error for ${cv.name}:`, updateError);
      return { success: false, error: `Database update failed: ${updateError.message}` };
    }

    console.log(`Successfully scored ${cv.name}: ${extracted.cv_score}`);
    return { success: true, score: extracted.cv_score };

  } catch (error: any) {
    console.error(`Error processing CV for ${cv.name}:`, error);
    return { success: false, error: error.message };
  }
}

async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXml = await zip.file('word/document.xml')?.async('string');
    
    if (!docXml) return '';
    
    // Extract text from XML
    const textContent = docXml
      .replace(/<w:p[^>]*>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .trim();
    
    return textContent;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    return '';
  }
}

async function processAllCVs(supabase: any, cvs: CVSubmission[]): Promise<void> {
  console.log(`Starting background processing of ${cvs.length} CVs`);
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < cvs.length; i++) {
    const cv = cvs[i];
    console.log(`Processing ${i + 1}/${cvs.length}: ${cv.name}`);
    
    const result = await processCV(supabase, cv);
    
    if (result.success) {
      successCount++;
    } else {
      failCount++;
      console.error(`Failed: ${cv.name} - ${result.error}`);
    }

    // Small delay between requests to avoid rate limiting
    if (i < cvs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`Background CV scoring complete: ${successCount} success, ${failCount} failed`);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for background processing
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all unscored CVs with file URLs
    const { data: unscoredCVs, error: queryError } = await supabase
      .from('cv_submissions')
      .select('id, name, email, cv_file_url, job_title, sector, location')
      .is('cv_score', null)
      .not('cv_file_url', 'is', null);

    if (queryError) {
      console.error('Query error:', queryError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch CVs', details: queryError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!unscoredCVs || unscoredCVs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No unscored CVs found', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${unscoredCVs.length} unscored CVs to process`);

    // Start background processing using EdgeRuntime.waitUntil
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(processAllCVs(supabase, unscoredCVs));

    // Return immediately
    return new Response(
      JSON.stringify({ 
        message: `Started re-scoring ${unscoredCVs.length} CVs in background`,
        count: unscoredCVs.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in rescore-cvs function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
