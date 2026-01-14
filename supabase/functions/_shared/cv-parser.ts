/**
 * Core CV parsing orchestration
 * Single entry point for parsing CVs from any source
 * Enhanced with validation, fallback extraction, and structured logging
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { callAI, extractToolCallArguments, AIMessage, AIMessageContent, AIClientError } from './ai-client.ts';
import { CV_EXTRACTION_SYSTEM_PROMPT, getExtractionToolSchema, buildExtractionUserPrompt } from './prompts.ts';
import { downloadFromStorage, downloadFromUrl, extractTextFromDocx, extractTextFromDoc, getFileType, toBase64 } from './file-handler.ts';
import { validateExtractedData, validateTextQuality, validateEmail, validatePhone, validateName } from './validation.ts';
import { extractWithFallback, mergeExtractions } from './fallback-parser.ts';
import { ParseLogger, storeParseAnalytics } from './logger.ts';
import type { ExtractedCVData, ParseResult, AIProfile, CVScoreBreakdown } from './types.ts';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely convert any value to an integer
 * Handles strings, numbers, decimals, and invalid values
 */
function toSafeInteger(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Math.round(value);
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : Math.round(parsed);
  }
  return fallback;
}

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
    console.log(`[CV Parser] DOCX text extracted: ${textContent.length} chars`);
  } else if (fileType === 'doc') {
    textContent = extractTextFromDoc(fileData);
    console.log(`[CV Parser] DOC text extracted: ${textContent.length} chars`);
  } else {
    // Try to read as text for unknown formats
    const decoder = new TextDecoder('utf-8', { fatal: false });
    textContent = decoder.decode(fileData);
    console.log(`[CV Parser] Unknown format text extracted: ${textContent.length} chars`);
  }

  if (!textContent || textContent.length < 50) {
    console.error(`[CV Parser] Insufficient text content: ${textContent?.length || 0} chars. Sample: ${textContent?.substring(0, 100) || 'EMPTY'}`);
    throw new Error(`Could not extract sufficient text content from document (got ${textContent?.length || 0} chars, need 50+)`);
  }
  
  console.log(`[CV Parser] Sending ${textContent.length} chars to AI for parsing`);

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
 * Aligned with frontend expectations for AIProfile and CVScoreBreakdown
 */
function validateAndCleanData(data: ExtractedCVData): ExtractedCVData {
  // Default AI profile structure (aligned with frontend)
  const defaultAIProfile: AIProfile = {
    summary_for_matching: '',
    key_achievements: [],
    hard_skills: [],
    soft_skills: [],
    certifications: [],
    industries: [],
    experience_years: 0,
    seniority: 'Mid-Level',
    education: {
      level: 'Other',
      field: '',
      institution: ''
    },
    ideal_roles: [],
    career_progression: ''
  };

  // Default score breakdown structure (aligned with frontend)
  const defaultScoreBreakdown: CVScoreBreakdown = {
    completeness: { score: 10, max: 20, notes: 'Not evaluated' },
    skills_relevance: { score: 10, max: 20, notes: 'Not evaluated' },
    experience_depth: { score: 12, max: 25, notes: 'Not evaluated' },
    achievements: { score: 8, max: 15, notes: 'Not evaluated' },
    education: { score: 5, max: 10, notes: 'Not evaluated' },
    presentation: { score: 5, max: 10, notes: 'Not evaluated' },
    summary: 'CV has not been fully evaluated.'
  };

  // Clean AI profile
  const aiProfile: AIProfile = {
    summary_for_matching: data.ai_profile?.summary_for_matching || '',
    key_achievements: Array.isArray(data.ai_profile?.key_achievements) ? data.ai_profile.key_achievements : [],
    hard_skills: Array.isArray(data.ai_profile?.hard_skills) ? data.ai_profile.hard_skills : [],
    soft_skills: Array.isArray(data.ai_profile?.soft_skills) ? data.ai_profile.soft_skills : [],
    certifications: Array.isArray(data.ai_profile?.certifications) ? data.ai_profile.certifications : [],
    industries: Array.isArray(data.ai_profile?.industries) ? data.ai_profile.industries : [],
    experience_years: toSafeInteger(
      data.ai_profile?.experience_years ?? data.years_experience,
      0
    ),
    seniority: data.ai_profile?.seniority || data.seniority_level || 'Mid-Level',
    education: {
      level: data.ai_profile?.education?.level || data.education_level || 'Other',
      field: data.ai_profile?.education?.field || '',
      institution: data.ai_profile?.education?.institution || ''
    },
    ideal_roles: Array.isArray(data.ai_profile?.ideal_roles) ? data.ai_profile.ideal_roles : [],
    career_progression: data.ai_profile?.career_progression || ''
  };

  // Clean score breakdown
  const scoreBreakdown: CVScoreBreakdown = {
    completeness: data.cv_score_breakdown?.completeness || defaultScoreBreakdown.completeness,
    skills_relevance: data.cv_score_breakdown?.skills_relevance || defaultScoreBreakdown.skills_relevance,
    experience_depth: data.cv_score_breakdown?.experience_depth || defaultScoreBreakdown.experience_depth,
    achievements: data.cv_score_breakdown?.achievements || defaultScoreBreakdown.achievements,
    education: data.cv_score_breakdown?.education || defaultScoreBreakdown.education,
    presentation: data.cv_score_breakdown?.presentation || defaultScoreBreakdown.presentation,
    summary: data.cv_score_breakdown?.summary || defaultScoreBreakdown.summary
  };

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
    years_experience: toSafeInteger(data.years_experience, 0),
    
    // Details
    skills: data.skills?.trim() || '',
    experience_summary: data.experience_summary?.trim() || '',
    education_level: data.education_level || 'Other',
    
    // AI profile (aligned with frontend)
    ai_profile: aiProfile,
    
    // Scoring (aligned with frontend)
    cv_score: typeof data.cv_score === 'number' ? Math.round(Math.min(100, Math.max(0, data.cv_score))) : 50,
    cv_score_breakdown: scoreBreakdown
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
