/**
 * Shared types for CV processing across all edge functions
 * Single source of truth for AI profiles, scoring, and parsed CV data
 * 
 * IMPORTANT: These types are aligned with frontend expectations in:
 * - src/components/admin/CVBulkImport.tsx
 * - src/components/admin/CVScoreBadge.tsx
 */

// ============================================================================
// AI Profile Types (aligned with frontend CVBulkImport.tsx)
// ============================================================================

export interface AIProfile {
  /** Comma-separated list of technical/hard skills */
  hard_skills: string[];
  /** Comma-separated list of interpersonal/soft skills */
  soft_skills: string[];
  /** Professional certifications and licenses */
  certifications: string[];
  /** Industries the candidate has worked in */
  industries: string[];
  /** Total years of professional experience */
  experience_years: number;
  /** Career seniority level */
  seniority: string;
  /** Education details */
  education: {
    level: string;
    field: string;
    institution: string;
  };
  /** Top career achievements */
  key_achievements: string[];
  /** Description of career progression */
  career_progression: string;
  /** Suitable job titles for the candidate */
  ideal_roles: string[];
  /** Professional summary for job matching */
  summary_for_matching: string;
}

// ============================================================================
// CV Scoring Types (aligned with frontend CVScoreBadge.tsx)
// ============================================================================

export interface ScoreCategory {
  score: number;
  max: number;
  notes?: string;
}

export interface CVScoreBreakdown {
  completeness: ScoreCategory;
  skills_relevance: ScoreCategory;
  experience_depth: ScoreCategory;
  achievements: ScoreCategory;
  education: ScoreCategory;
  presentation: ScoreCategory;
  /** AI-generated summary of CV quality */
  summary: string;
}

// ============================================================================
// Extracted CV Data Types
// ============================================================================

export interface ExtractedCVData {
  // Basic info
  name: string;
  email: string;
  phone: string;
  location: string;
  
  // Professional info
  job_title: string;
  sector: string;
  seniority_level: string;
  years_experience: number;
  
  // Details
  skills: string;
  experience_summary: string;
  education_level: string;
  
  // AI-generated
  ai_profile: AIProfile;
  cv_score: number;
  cv_score_breakdown: CVScoreBreakdown;
}

// ============================================================================
// Parse Result Types
// ============================================================================

export interface ParseSuccess {
  success: true;
  data: ExtractedCVData;
}

export interface ParseError {
  success: false;
  error: string;
  errorCode?: 'RATE_LIMIT' | 'PAYMENT_REQUIRED' | 'PARSE_ERROR' | 'FILE_ERROR' | 'AI_ERROR';
}

export type ParseResult = ParseSuccess | ParseError;

// ============================================================================
// Database Types (matching Supabase schema)
// ============================================================================

export interface CVSubmission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  cv_file_url?: string | null;
  message?: string | null;
  source?: string;
  job_title?: string | null;
  sector?: string | null;
  location?: string | null;
  admin_notes?: string | null;
  skills?: string | null;
  experience_summary?: string | null;
  education_level?: string | null;
  seniority_level?: string | null;
  years_experience?: number | null;
  ai_profile?: AIProfile | null;
  cv_score?: number | null;
  cv_score_breakdown?: CVScoreBreakdown | null;
  scored_at?: string | null;
  user_id?: string | null;
  added_by?: string | null;
  created_at?: string;
}

export interface BulkImportSession {
  id: string;
  user_id: string;
  user_email: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_files: number;
  parsed_count: number;
  imported_count: number;
  failed_count: number;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  created_at: string;
  // New fields for robust processing
  last_heartbeat?: string | null;
  processing_file_id?: string | null;
  batch_size?: number;
  avg_parse_time_ms?: number | null;
  total_retry_count?: number;
  error_breakdown?: Record<string, number>;
}

export interface BulkImportFile {
  id: string;
  session_id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  status: 'pending' | 'parsing' | 'parsed' | 'importing' | 'imported' | 'error';
  parsed_data?: ExtractedCVData | null;
  cv_submission_id?: string | null;
  error_message?: string | null;
  processed_at?: string | null;
  created_at: string;
  // New fields for robust processing
  retry_count?: number;
  error_category?: string | null;
  processing_started_at?: string | null;
  file_size_bytes?: number | null;
}

// ============================================================================
// Constants
// ============================================================================

export const VALID_SECTORS = [
  'Finance',
  'Technology',
  'Healthcare',
  'Legal',
  'Engineering',
  'Marketing',
  'Human Resources',
  'Sales',
  'Operations',
  'Other'
] as const;

export const SENIORITY_LEVELS = [
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP',
  'C-Level',
  'Executive'
] as const;

export const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD',
  'Professional Certification',
  'Other'
] as const;

export type Sector = typeof VALID_SECTORS[number];
export type SeniorityLevel = typeof SENIORITY_LEVELS[number];
export type EducationLevel = typeof EDUCATION_LEVELS[number];
