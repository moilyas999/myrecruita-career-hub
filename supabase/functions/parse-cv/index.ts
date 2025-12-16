import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import JSZip from 'https://esm.sh/jszip@3.10.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIProfile {
  hard_skills: string[];
  soft_skills: string[];
  certifications: string[];
  industries: string[];
  experience_years: number;
  seniority: string;
  education: {
    level: string;
    field: string;
    institution: string;
  };
  key_achievements: string[];
  career_progression: string;
  ideal_roles: string[];
  summary_for_matching: string;
}

interface ExtractedCVData {
  name: string;
  email: string;
  phone: string;
  job_title: string;
  sector: string;
  location: string;
  skills: string;
  experience_summary: string;
  years_experience: number;
  education_level: string;
  seniority_level: string;
  ai_profile: AIProfile;
}

// Extract text content from DOCX files
async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log('Extracting text from DOCX file...');
  
  const zip = await JSZip.loadAsync(arrayBuffer);
  const documentXml = await zip.file('word/document.xml')?.async('string');
  
  if (!documentXml) {
    throw new Error('Could not find document.xml in DOCX file');
  }
  
  // Extract text from <w:t> tags (Word text content)
  const textMatches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
  const text = textMatches
    .map(match => match.replace(/<[^>]+>/g, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('Extracted text length:', text.length, 'characters');
  console.log('Text preview:', text.substring(0, 500));
  
  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { fileName, fileUrl } = body as { fileName?: string; fileUrl?: string };

    let filePath = (body as any)?.filePath as string | undefined;

    if (!filePath && typeof fileUrl === 'string') {
      const marker = '/cv-uploads/';
      const idx = fileUrl.indexOf(marker);
      if (idx !== -1) {
        filePath = decodeURIComponent(fileUrl.slice(idx + marker.length));
      }
    }
    
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'File path is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing CV file:', filePath);
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('cv-uploads')
      .download(filePath);

    if (downloadError) {
      console.error('Storage download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    console.log('File downloaded, size:', fileData.size, 'bytes');

    // Determine file type from extension
    const extension = filePath.toLowerCase().split('.').pop();
    console.log('File extension:', extension);

    const arrayBuffer = await fileData.arrayBuffer();

    // Get Lovable AI API key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an EXPERT CV/Resume parser with 100% accuracy. Your job is to extract ALL information from CV documents and create a comprehensive candidate profile for AI-powered job matching.

CRITICAL RULES - YOU MUST FOLLOW:
1. EVERY field MUST be filled - no empty strings, no "N/A", no "Not provided"
2. Extract EXACT information when clearly visible
3. Make INTELLIGENT INFERENCES when information is implicit or partially visible
4. Look EVERYWHERE in the document - headers, footers, contact sections, signatures
5. Create a RICH AI PROFILE for accurate job matching

FIELD EXTRACTION GUIDE:

NAME: Look for the largest/boldest text at the top, or after "Name:", or in email addresses (john.smith@ = John Smith)

EMAIL: Find @ symbol. Common patterns: name@domain.com, first.last@company.com

PHONE: Look for numbers with 7+ digits. Formats include:
- +44 7XXX XXX XXX (UK mobile)
- 07XXX XXXXXX (UK)
- +1 (XXX) XXX-XXXX (US)
- Any number near "Tel:", "Phone:", "Mobile:", "Cell:", "Contact:"

JOB TITLE: Use the MOST RECENT job title. Look for:
- Current role at top of experience section
- "Current Position:", "Role:", job titles in bold
- If unclear, use the most senior/recent sounding title

SECTOR: Infer from company types, job titles, skills. Choose from:
- Finance & Accounting, Technology & IT, Healthcare & Medical, Legal
- Marketing & Sales, Human Resources, Engineering, Construction & Property
- Retail & Hospitality, Education, Manufacturing, Other

LOCATION: Look for city names, addresses, "Based in:", "Location:". Extract the city/region name.

SKILLS: List ALL mentioned skills, technologies, certifications, languages, tools. Comma-separated.

EXPERIENCE SUMMARY: Write 2-3 sentences summarizing their career, seniority level, and key achievements.

YEARS OF EXPERIENCE: Calculate total professional experience in years from work history dates.

EDUCATION LEVEL: Highest qualification - PhD, Masters, Bachelors, Diploma, A-Levels, GCSEs, or Professional Certification

SENIORITY LEVEL: Entry, Junior, Mid-Level, Senior, Lead, Manager, Director, Executive, C-Level

AI PROFILE EXTRACTION (for job matching):
- hard_skills: Technical skills, tools, software, methodologies (array of strings)
- soft_skills: Leadership, communication, teamwork indicators (array of strings)
- certifications: Professional qualifications like ACA, ACCA, CFA, PMP, CIMA, etc. (array)
- industries: All industries they've worked in (array)
- experience_years: Total years of professional experience (number)
- seniority: Entry/Junior/Mid-Level/Senior/Lead/Manager/Director/Executive/C-Level (string)
- education: Object with level, field, and institution of highest qualification
- key_achievements: 3-5 quantifiable achievements from the CV (array)
- career_progression: Entry/Growing/Stable/Transitioning/Senior (string describing career trajectory)
- ideal_roles: 3-5 job titles they'd be perfect for based on experience (array)
- summary_for_matching: A 50-100 word summary optimized for keyword matching with job descriptions

REMEMBER: A blank field is FAILURE. Every CV has enough context to fill ALL fields with intelligent extraction and inference.`;

    const userPrompt = `Analyze this CV document and extract ALL candidate information plus create a comprehensive AI profile for job matching.

REQUIREMENTS:
- Name: Full name (REQUIRED - every CV has this)
- Email: Email address (REQUIRED - look carefully)
- Phone: Phone number (look for any number format)
- Job Title: Current/recent title (infer from experience if needed)
- Sector: Industry (infer from companies/roles)
- Location: City/region (look for addresses)
- Skills: All skills mentioned (comma-separated)
- Experience Summary: 2-3 sentence career overview
- Years Experience: Total professional years (number)
- Education Level: Highest qualification
- Seniority Level: Career level

AI PROFILE (for job matching):
- Extract hard skills, soft skills, certifications
- Identify all industries worked in
- Calculate experience years
- Determine seniority level
- Extract education details
- List key achievements (quantified where possible)
- Assess career progression
- Suggest ideal job titles
- Write a matching-optimized summary

DO NOT return empty fields. Extract or infer everything.`;

    // Build message content based on file type
    let messageContent: any[];

    if (extension === 'pdf') {
      // PDF: Use multimodal approach (Gemini can read PDFs directly)
      console.log('Using multimodal approach for PDF...');
      
      const uint8Array = new Uint8Array(arrayBuffer);
      let base64 = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        base64 += String.fromCharCode.apply(null, Array.from(chunk));
      }
      base64 = btoa(base64);
      console.log('Base64 encoded PDF, length:', base64.length);

      messageContent = [
        {
          type: 'file',
          file: {
            filename: filePath.split('/').pop() || 'document.pdf',
            file_data: `data:application/pdf;base64,${base64}`
          }
        },
        { type: 'text', text: userPrompt }
      ];
    } else if (extension === 'docx') {
      // DOCX: Extract text first, then send text to AI
      console.log('Using text extraction approach for DOCX...');
      
      const textContent = await extractTextFromDocx(arrayBuffer);
      
      if (!textContent || textContent.length < 50) {
        throw new Error('Could not extract sufficient text from DOCX file');
      }

      messageContent = [{
        type: 'text',
        text: `${userPrompt}

--- CV DOCUMENT CONTENT ---

${textContent}`
      }];
    } else if (extension === 'doc') {
      throw new Error('Legacy .doc format is not supported. Please convert to .docx or .pdf');
    } else {
      throw new Error(`Unsupported file type: ${extension}`);
    }

    console.log('Calling Gemini 2.5 Pro for enhanced CV extraction...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageContent }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'extract_cv_data',
            description: 'Extract ALL structured data from a CV including a comprehensive AI profile for job matching. Every field is REQUIRED.',
            parameters: {
              type: 'object',
              properties: {
                name: { 
                  type: 'string', 
                  description: 'Full name of the candidate - REQUIRED' 
                },
                email: { 
                  type: 'string', 
                  description: 'Email address - REQUIRED' 
                },
                phone: { 
                  type: 'string', 
                  description: 'Phone number (any format) - REQUIRED' 
                },
                job_title: { 
                  type: 'string', 
                  description: 'Current or most recent job title - REQUIRED' 
                },
                sector: { 
                  type: 'string', 
                  description: 'Industry sector - REQUIRED' 
                },
                location: { 
                  type: 'string', 
                  description: 'City/region/country - REQUIRED' 
                },
                skills: { 
                  type: 'string', 
                  description: 'All skills comma-separated - REQUIRED' 
                },
                experience_summary: { 
                  type: 'string', 
                  description: '2-3 sentence career summary - REQUIRED' 
                },
                years_experience: {
                  type: 'number',
                  description: 'Total years of professional experience - REQUIRED'
                },
                education_level: {
                  type: 'string',
                  description: 'Highest education level (PhD, Masters, Bachelors, Diploma, A-Levels, GCSEs, Professional Certification) - REQUIRED'
                },
                seniority_level: {
                  type: 'string',
                  description: 'Career seniority (Entry, Junior, Mid-Level, Senior, Lead, Manager, Director, Executive, C-Level) - REQUIRED'
                },
                ai_profile: {
                  type: 'object',
                  description: 'Comprehensive AI profile for job matching - REQUIRED',
                  properties: {
                    hard_skills: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Technical skills, tools, software, methodologies'
                    },
                    soft_skills: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Leadership, communication, teamwork indicators'
                    },
                    certifications: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Professional qualifications (ACA, ACCA, CFA, PMP, etc.)'
                    },
                    industries: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'All industries worked in'
                    },
                    experience_years: {
                      type: 'number',
                      description: 'Total years of experience'
                    },
                    seniority: {
                      type: 'string',
                      description: 'Seniority level'
                    },
                    education: {
                      type: 'object',
                      properties: {
                        level: { type: 'string' },
                        field: { type: 'string' },
                        institution: { type: 'string' }
                      }
                    },
                    key_achievements: {
                      type: 'array',
                      items: { type: 'string' },
                      description: '3-5 quantifiable achievements'
                    },
                    career_progression: {
                      type: 'string',
                      description: 'Career trajectory: Entry/Growing/Stable/Transitioning/Senior'
                    },
                    ideal_roles: {
                      type: 'array',
                      items: { type: 'string' },
                      description: '3-5 job titles they would be ideal for'
                    },
                    summary_for_matching: {
                      type: 'string',
                      description: '50-100 word summary optimized for keyword matching with job descriptions'
                    }
                  },
                  required: ['hard_skills', 'soft_skills', 'certifications', 'industries', 'experience_years', 'seniority', 'education', 'key_achievements', 'career_progression', 'ideal_roles', 'summary_for_matching']
                }
              },
              required: ['name', 'email', 'phone', 'job_title', 'sector', 'location', 'skills', 'experience_summary', 'years_experience', 'education_level', 'seniority_level', 'ai_profile'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'extract_cv_data' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received:', JSON.stringify(aiData, null, 2));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_cv_data') {
      console.error('Unexpected AI response format:', aiData);
      throw new Error('Unexpected AI response format');
    }

    const extractedData: ExtractedCVData = JSON.parse(toolCall.function.arguments);
    console.log('Extracted CV data:', JSON.stringify(extractedData, null, 2));

    // Validate extraction quality
    const basicFields = ['name', 'email', 'phone', 'job_title', 'sector', 'location', 'skills', 'experience_summary'];
    const filledBasicFields = basicFields.filter(f => (extractedData as any)[f]?.toString().trim());
    
    const profileFields = extractedData.ai_profile ? Object.keys(extractedData.ai_profile).length : 0;
    
    console.log(`Extraction quality: ${filledBasicFields.length}/${basicFields.length} basic fields, ${profileFields} profile fields`);

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        quality: {
          basic: `${filledBasicFields.length}/${basicFields.length}`,
          profile_fields: profileFields,
          has_ai_profile: !!extractedData.ai_profile
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-cv function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
