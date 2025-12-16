import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import JSZip from 'https://esm.sh/jszip@3.10.1';
import pdf from 'https://esm.sh/pdf-parse@1.1.1/lib/pdf-parse.js';

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

    console.log('Downloading file from storage:', filePath);
    
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

    console.log('File downloaded, size:', fileData.size);

    const contentType = fileData.type || '';
    const lowerFileName = (fileName || filePath || '').toLowerCase();
    let textContent = '';

    // Handle PDF files
    if (contentType.includes('pdf') || lowerFileName.endsWith('.pdf')) {
      console.log('Parsing PDF file...');
      try {
        const arrayBuffer = await fileData.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const pdfData = await pdf(uint8Array);
        textContent = pdfData.text || '';
        console.log('PDF parsed successfully, text length:', textContent.length);
      } catch (pdfError) {
        console.error('PDF parse error:', pdfError);
        // Fallback: try basic text extraction
        const arrayBuffer = await fileData.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawText = decoder.decode(new Uint8Array(arrayBuffer));
        textContent = rawText.replace(/[^\x20-\x7E\s]/g, ' ').replace(/\s+/g, ' ').trim();
        console.log('PDF fallback extraction, text length:', textContent.length);
      }
    }
    // Handle DOCX files
    else if (
      contentType.includes('wordprocessingml') || 
      contentType.includes('msword') ||
      lowerFileName.endsWith('.docx') ||
      lowerFileName.endsWith('.doc')
    ) {
      console.log('Parsing DOCX file...');
      try {
        const arrayBuffer = await fileData.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        // Get the main document content
        const documentXml = await zip.file('word/document.xml')?.async('string');
        
        if (documentXml) {
          // Extract text from <w:t> tags (Word text elements)
          const textMatches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
          if (textMatches) {
            textContent = textMatches
              .map(match => match.replace(/<[^>]+>/g, ''))
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
          console.log('DOCX parsed successfully, text length:', textContent.length);
        } else {
          console.log('No document.xml found in DOCX');
        }
        
        // If still no content, try other XML files
        if (textContent.length < 50) {
          const files = Object.keys(zip.files);
          console.log('DOCX files:', files.join(', '));
          
          for (const file of files) {
            if (file.endsWith('.xml') && !file.includes('rels')) {
              const xmlContent = await zip.file(file)?.async('string');
              if (xmlContent) {
                const matches = xmlContent.match(/>([^<]+)</g);
                if (matches) {
                  const extracted = matches
                    .map(m => m.slice(1, -1).trim())
                    .filter(t => t.length > 2 && /[a-zA-Z]/.test(t))
                    .join(' ');
                  if (extracted.length > textContent.length) {
                    textContent = extracted;
                  }
                }
              }
            }
          }
        }
      } catch (docxError) {
        console.error('DOCX parse error:', docxError);
        // Fallback for .doc files (older format, not ZIP-based)
        const arrayBuffer = await fileData.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawText = decoder.decode(new Uint8Array(arrayBuffer));
        textContent = rawText.replace(/[^\x20-\x7E\s]/g, ' ').replace(/\s+/g, ' ').trim();
        console.log('DOCX fallback extraction, text length:', textContent.length);
      }
    } else {
      // Plain text
      textContent = await fileData.text();
    }

    console.log('Final extracted text length:', textContent.length);
    console.log('Text preview (first 1000 chars):', textContent.substring(0, 1000));

    if (textContent.length < 20) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract sufficient text from file',
          extracted: textContent,
          hint: 'The file may be image-based or password protected'
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
- Phone number (various formats including international)
- Current or most recent job title
- Industry/sector they work in
- Location/city
- Key skills (technical and soft skills)
- Brief summary of their work experience

If information is not clearly available, make reasonable inferences from context or leave empty.`
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
