/**
 * Shared types for CV processing across all edge functions
 * Single source of truth for AI profiles, scoring, and parsed CV data
 */

// ============================================================================
// AI Profile Types
// ============================================================================

export interface AIProfile {
  professional_summary: string;
  key_achievements: string[];
  hard_skills: string[];
  soft_skills: string[];
  certifications: string[];
  languages: string[];
  ideal_roles: string[];
  career_trajectory: string;
  unique_value_proposition: string;
}

// ============================================================================
// CV Scoring Types
// ============================================================================

export interface ScoreCategory {
  score: number;
  notes: string;
}

export interface CVScoreBreakdown {
  completeness: ScoreCategory;
  skills_depth: ScoreCategory;
  experience_quality: ScoreCategory;
  achievements: ScoreCategory;
  education: ScoreCategory;
  presentation: ScoreCategory;
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
