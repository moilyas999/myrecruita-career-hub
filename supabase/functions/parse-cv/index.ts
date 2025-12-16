import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedCVData {
  name: string;
  email: string;
  phone: string;
  job_title: string;
  sector: string;
  location: string;
  skills: string;
  experience_summary: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, fileName } = await req.json();
    
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'File path is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Downloading file from storage:', filePath);
    
    // Create Supabase client with service role key to access private storage
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Download file directly from private storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('cv-uploads')
      .download(filePath);

    if (downloadError) {
      console.error('Storage download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    console.log('File downloaded, size:', fileData.size);

    const contentType = fileData.type || '';
    let textContent = '';

    // Handle different file types
    if (contentType.includes('pdf') || fileName?.toLowerCase().endsWith('.pdf')) {
      // For PDF files, we'll extract raw text using a simple approach
      // The AI will do its best to parse the content
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Simple PDF text extraction - look for text between stream markers
      // This is a basic approach; the AI will handle the messy text
      let rawText = '';
      try {
        const decoder = new TextDecoder('utf-8', { fatal: false });
        rawText = decoder.decode(bytes);
        
        // Try to extract readable text from PDF structure
        const textMatches = rawText.match(/\(([^)]+)\)/g);
        if (textMatches) {
          textContent = textMatches
            .map(m => m.slice(1, -1))
            .filter(t => t.length > 1 && /[a-zA-Z]/.test(t))
            .join(' ');
        }
        
        // If no good text found, try another approach
        if (textContent.length < 50) {
          // Look for BT...ET text blocks
          const btMatches = rawText.match(/BT[\s\S]*?ET/g);
          if (btMatches) {
            textContent = btMatches.join(' ').replace(/[^\x20-\x7E\s]/g, ' ');
          }
        }
        
        // Final fallback - just filter for readable characters
        if (textContent.length < 50) {
          textContent = rawText.replace(/[^\x20-\x7E\s]/g, ' ').replace(/\s+/g, ' ');
        }
      } catch (e) {
        console.log('PDF parsing fallback:', e);
        textContent = 'PDF content could not be fully extracted. Filename: ' + (fileName || 'unknown');
      }
    } else if (
      contentType.includes('wordprocessingml') || 
      contentType.includes('msword') ||
      fileName?.toLowerCase().endsWith('.docx') ||
      fileName?.toLowerCase().endsWith('.doc')
    ) {
      // For DOCX files (which are ZIP archives)
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      try {
        // DOCX is a ZIP file, look for the document.xml content
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawContent = decoder.decode(bytes);
        
        // Try to extract text from XML tags
        const textMatches = rawContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
        if (textMatches) {
          textContent = textMatches
            .map(m => m.replace(/<[^>]+>/g, ''))
            .join(' ');
        }
        
        // Fallback: extract any readable text
        if (textContent.length < 50) {
          textContent = rawContent.replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\s]/g, ' ').replace(/\s+/g, ' ');
        }
      } catch (e) {
        console.log('DOCX parsing fallback:', e);
        textContent = 'DOCX content could not be fully extracted. Filename: ' + (fileName || 'unknown');
      }
    } else {
      // Plain text or other
      textContent = await fileData.text();
    }

    console.log('Extracted text length:', textContent.length);
    console.log('Text preview:', textContent.substring(0, 500));

    if (textContent.length < 10) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract text from file',
          extracted: textContent 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to extract structured data
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a CV/resume parser. Extract candidate information from the provided CV text. 
Be thorough and look for:
- Full name (usually at the top)
- Email address (look for @ symbol)
- Phone number (various formats)
- Current or most recent job title
- Industry/sector they work in
- Location/city
- Key skills (technical and soft skills)
- Brief summary of their work experience

If information is not clearly available, make reasonable inferences from context or leave empty.
The text may be messy due to PDF extraction - do your best to identify the relevant information.`
          },
          {
            role: 'user',
            content: `Extract candidate information from this CV:\n\n${textContent.substring(0, 15000)}`
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'extract_cv_data',
            description: 'Extract structured candidate data from a CV/resume',
            parameters: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Full name of the candidate' },
                email: { type: 'string', description: 'Email address' },
                phone: { type: 'string', description: 'Phone number' },
                job_title: { type: 'string', description: 'Current or most recent job title' },
                sector: { type: 'string', description: 'Industry or sector (e.g., Finance, Technology, Healthcare)' },
                location: { type: 'string', description: 'City or location' },
                skills: { type: 'string', description: 'Key skills, comma-separated' },
                experience_summary: { type: 'string', description: 'Brief summary of work experience (2-3 sentences)' }
              },
              required: ['name', 'email'],
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
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    // Extract the tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_cv_data') {
      throw new Error('Unexpected AI response format');
    }

    const extractedData: ExtractedCVData = JSON.parse(toolCall.function.arguments);
    console.log('Extracted data:', extractedData);

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        textLength: textContent.length
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
