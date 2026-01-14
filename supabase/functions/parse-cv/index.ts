/**
 * Parse CV Edge Function
 * 
 * Simplified function that uses shared utilities for CV parsing.
 * Accepts a file path in storage and returns extracted CV data.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createSupabaseClient } from '../_shared/file-handler.ts';
import { parseCV } from '../_shared/cv-parser.ts';

interface ParseCVRequest {
  filePath?: string;
  fileUrl?: string;
  fileName?: string;
  bucket?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: ParseCVRequest = await req.json();
    let { filePath, fileUrl, bucket = 'cv-uploads' } = body;

    // Extract filePath from fileUrl if not provided directly
    if (!filePath && typeof fileUrl === 'string') {
      const marker = '/cv-uploads/';
      const idx = fileUrl.indexOf(marker);
      if (idx !== -1) {
        filePath = decodeURIComponent(fileUrl.slice(idx + marker.length).split('?')[0]);
      }
    }

    if (!filePath) {
      return errorResponse('filePath or fileUrl is required', 400);
    }

    console.log(`Parse CV request: ${filePath} (bucket: ${bucket})`);

    // Create Supabase client
    const supabase = createSupabaseClient();

    // Parse the CV using shared parser
    const result = await parseCV(supabase, filePath, { bucket });

    if (!result.success) {
      // Map error codes to HTTP status codes
      const statusMap: Record<string, number> = {
        'RATE_LIMIT': 429,
        'PAYMENT_REQUIRED': 402,
        'FILE_ERROR': 404,
        'PARSE_ERROR': 422,
        'AI_ERROR': 500
      };
      const status = statusMap[result.errorCode || 'PARSE_ERROR'] || 500;
      
      return errorResponse(result.error, status);
    }

    // Return data in format expected by frontend
    return jsonResponse({
      success: true,
      data: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        job_title: result.data.job_title,
        sector: result.data.sector,
        location: result.data.location,
        skills: result.data.skills,
        experience_summary: result.data.experience_summary,
        years_experience: result.data.years_experience,
        education_level: result.data.education_level,
        seniority_level: result.data.seniority_level,
        ai_profile: result.data.ai_profile,
        cv_score: result.data.cv_score,
        cv_score_breakdown: result.data.cv_score_breakdown
      },
      message: `Successfully parsed CV for ${result.data.name}`
    });

  } catch (error) {
    console.error('Parse CV error:', error);
    return errorResponse(
      `Failed to parse CV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
});
