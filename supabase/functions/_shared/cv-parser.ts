/**
 * Core CV parsing orchestration
 * Single entry point for parsing CVs from any source
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { callAI, extractToolCallArguments, AIMessage, AIMessageContent, AIClientError } from './ai-client.ts';
import { CV_EXTRACTION_SYSTEM_PROMPT, getExtractionToolSchema, buildExtractionUserPrompt } from './prompts.ts';
import { downloadFromStorage, downloadFromUrl, extractTextFromDocx, extractTextFromDoc, getFileType, toBase64 } from './file-handler.ts';
import type { ExtractedCVData, ParseResult } from './types.ts';

// ============================================================================
// Types
// ============================================================================

export interface ParseOptions {
  /** Storage bucket name (default: 'cv-uploads') */
  bucket?: string;
  /** Whether the path is a full URL */
  isUrl?: boolean;
}

// ============================================================================
// Main Parsing Function
// ============================================================================

/**
 * Parse a CV file and extract structured data using AI
 * 
 * @param supabase - Supabase client instance
 * @param filePath - Path to file in storage or full URL
 * @param options - Parsing options
 * @returns ParseResult with extracted data or error
 */
export async function parseCV(
  supabase: SupabaseClient,
  filePath: string,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const { bucket = 'cv-uploads', isUrl = false } = options;

  try {
    console.log(`Parsing CV: ${filePath}`);

    // Step 1: Download the file
    const downloadResult = isUrl 
      ? await downloadFromUrl(filePath)
      : await downloadFromStorage(supabase, bucket, filePath);

    if (!downloadResult.success) {
      return {
        success: false,
        error: downloadResult.error,
        errorCode: 'FILE_ERROR'
      };
    }

    const { data: fileData, fileName, mimeType } = downloadResult;
    const fileType = getFileType(fileName);

    // Step 2: Prepare content for AI
    const messages = await prepareAIMessages(fileData, fileType, mimeType);

    // Step 3: Call AI with tool calling for structured output
    const response = await callAI({
      messages,
      tools: [getExtractionToolSchema()],
      tool_choice: { type: 'function', function: { name: 'extract_cv_data' } },
      temperature: 0.1,
      max_tokens: 4096
    });

    // Step 4: Extract and validate the result
    const extractedData = extractToolCallArguments<ExtractedCVData>(response, 'extract_cv_data');

    if (!extractedData) {
      console.error('Failed to extract data from AI response');
      return {
        success: false,
        error: 'Failed to parse CV - AI did not return expected data format',
        errorCode: 'PARSE_ERROR'
      };
    }

    // Step 5: Validate and clean the data
    const cleanedData = validateAndCleanData(extractedData);

    console.log(`Successfully parsed CV for: ${cleanedData.name}`);
    return {
      success: true,
      data: cleanedData
    };

  } catch (error) {
    console.error('CV parsing error:', error);

    // Handle known error types
    if ((error as AIClientError).code) {
      const aiError = error as AIClientError;
      return {
        success: false,
        error: aiError.message,
        errorCode: aiError.code === 'RATE_LIMIT' ? 'RATE_LIMIT' 
          : aiError.code === 'PAYMENT_REQUIRED' ? 'PAYMENT_REQUIRED'
          : 'AI_ERROR'
      };
    }

    return {
      success: false,
      error: `Failed to parse CV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      errorCode: 'PARSE_ERROR'
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Prepare AI messages based on file type
 * PDFs are sent as base64 images, DOCX/DOC as extracted text
 */
async function prepareAIMessages(
  fileData: ArrayBuffer,
  fileType: string,
  mimeType: string
): Promise<AIMessage[]> {
  const systemMessage: AIMessage = {
    role: 'system',
    content: CV_EXTRACTION_SYSTEM_PROMPT
  };

  if (fileType === 'pdf') {
    // Send PDF as base64 image (Gemini can read PDFs via image_url)
    const base64 = toBase64(fileData);
    const userContent: AIMessageContent[] = [
      {
        type: 'text',
        text: buildExtractionUserPrompt(false)
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${base64}`
        }
      }
    ];

    return [
      systemMessage,
      { role: 'user', content: userContent }
    ];
  }

  // For DOCX/DOC, extract text first
  let textContent: string;
  
  if (fileType === 'docx') {
    textContent = await extractTextFromDocx(fileData);
  } else if (fileType === 'doc') {
    textContent = extractTextFromDoc(fileData);
  } else {
    // Try to read as text for unknown formats
    const decoder = new TextDecoder('utf-8', { fatal: false });
    textContent = decoder.decode(fileData);
  }

  if (!textContent || textContent.length < 50) {
    throw new Error('Could not extract sufficient text content from document');
  }

  return [
    systemMessage,
    {
      role: 'user',
      content: `${buildExtractionUserPrompt(true)}\n\n---\n\n${textContent}`
    }
  ];
}

/**
 * Validate and clean extracted data, ensuring all required fields have values
 */
function validateAndCleanData(data: ExtractedCVData): ExtractedCVData {
  return {
    // Required fields with fallbacks
    name: data.name?.trim() || 'Unknown',
    email: data.email?.trim() || 'not-provided@unknown.com',
    phone: data.phone?.trim() || 'Not provided',
    location: data.location?.trim() || 'Not specified',
    
    // Professional info
    job_title: data.job_title?.trim() || 'Not specified',
    sector: data.sector || 'Other',
    seniority_level: data.seniority_level || 'Mid-Level',
    years_experience: typeof data.years_experience === 'number' ? data.years_experience : 0,
    
    // Details
    skills: data.skills?.trim() || '',
    experience_summary: data.experience_summary?.trim() || '',
    education_level: data.education_level || 'Other',
    
    // AI profile with defaults
    ai_profile: {
      professional_summary: data.ai_profile?.professional_summary || '',
      key_achievements: data.ai_profile?.key_achievements || [],
      hard_skills: data.ai_profile?.hard_skills || [],
      soft_skills: data.ai_profile?.soft_skills || [],
      certifications: data.ai_profile?.certifications || [],
      languages: data.ai_profile?.languages || [],
      ideal_roles: data.ai_profile?.ideal_roles || [],
      career_trajectory: data.ai_profile?.career_trajectory || '',
      unique_value_proposition: data.ai_profile?.unique_value_proposition || ''
    },
    
    // Scoring with defaults
    cv_score: typeof data.cv_score === 'number' ? Math.min(100, Math.max(0, data.cv_score)) : 50,
    cv_score_breakdown: {
      completeness: data.cv_score_breakdown?.completeness || { score: 10, notes: 'Not evaluated' },
      skills_depth: data.cv_score_breakdown?.skills_depth || { score: 10, notes: 'Not evaluated' },
      experience_quality: data.cv_score_breakdown?.experience_quality || { score: 12, notes: 'Not evaluated' },
      achievements: data.cv_score_breakdown?.achievements || { score: 8, notes: 'Not evaluated' },
      education: data.cv_score_breakdown?.education || { score: 5, notes: 'Not evaluated' },
      presentation: data.cv_score_breakdown?.presentation || { score: 5, notes: 'Not evaluated' }
    }
  };
}

// ============================================================================
// Batch Processing Utilities
// ============================================================================

/**
 * Parse multiple CVs with rate limiting
 */
export async function parseCVsBatch(
  supabase: SupabaseClient,
  filePaths: string[],
  options: ParseOptions & { delayMs?: number } = {}
): Promise<Map<string, ParseResult>> {
  const { delayMs = 1000, ...parseOptions } = options;
  const results = new Map<string, ParseResult>();

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    console.log(`Processing ${i + 1}/${filePaths.length}: ${filePath}`);

    const result = await parseCV(supabase, filePath, parseOptions);
    results.set(filePath, result);

    // Rate limiting delay between requests
    if (i < filePaths.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
