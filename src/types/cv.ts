/**
 * Shared CV types for frontend components
 * Single source of truth for CV-related interfaces
 * 
 * These types match the backend types in supabase/functions/_shared/types.ts
 */

// ============================================================================
// AI Profile Types
// ============================================================================

export interface AIProfile {
  /** Technical and specialized skills */
  hard_skills: string[];
  /** Interpersonal and transferable skills */
  soft_skills: string[];
  /** Professional certifications and licenses */
  certifications: string[];
  /** Industries the candidate has experience in */
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
// CV Scoring Types
// ============================================================================

export interface ScoreCategory {
  score: number;
  max: number;
  notes?: string;
}

export interface CVScoreBreakdown {
  completeness: ScoreCategory | number;
  skills_relevance: ScoreCategory | number;
  experience_depth: ScoreCategory | number;
  achievements: ScoreCategory | number;
  education: ScoreCategory | number;
  presentation: ScoreCategory | number;
  /** AI-generated summary of CV quality */
  summary?: string;
}

// ============================================================================
// Legacy Type Support
// ============================================================================

/**
 * Legacy AI profile format from older backend versions
 * Used for backward compatibility when displaying historical data
 */
export interface LegacyAIProfile {
  professional_summary?: string;
  career_trajectory?: string;
  languages?: string[];
  unique_value_proposition?: string;
  // Common fields that exist in both formats
  hard_skills?: string[];
  soft_skills?: string[];
  certifications?: string[];
  key_achievements?: string[];
  ideal_roles?: string[];
}

/**
 * Legacy score breakdown format
 * Historical data may use different field names
 */
export interface LegacyCVScoreBreakdown {
  skills_depth?: ScoreCategory | number;
  experience_quality?: ScoreCategory | number;
  // Common fields
  completeness?: ScoreCategory | number;
  achievements?: ScoreCategory | number;
  education?: ScoreCategory | number;
  presentation?: ScoreCategory | number;
}

// ============================================================================
// Normalization Utilities
// ============================================================================

/**
 * Normalize an AI profile from any format to the current format
 */
export function normalizeAIProfile(profile: AIProfile | LegacyAIProfile | null | undefined): AIProfile | null {
  if (!profile) return null;
  
  // Check if it's already in current format
  if ('summary_for_matching' in profile && profile.summary_for_matching) {
    return profile as AIProfile;
  }
  
  // Convert from legacy format
  const legacyProfile = profile as LegacyAIProfile;
  
  return {
    hard_skills: legacyProfile.hard_skills || [],
    soft_skills: legacyProfile.soft_skills || [],
    certifications: legacyProfile.certifications || [],
    industries: legacyProfile.languages || [], // languages was renamed to industries
    experience_years: 0, // Not available in legacy
    seniority: 'Mid-Level', // Not available in legacy
    education: {
      level: 'Other',
      field: '',
      institution: ''
    },
    key_achievements: legacyProfile.key_achievements || [],
    career_progression: legacyProfile.career_trajectory || '', // renamed
    ideal_roles: legacyProfile.ideal_roles || [],
    summary_for_matching: legacyProfile.professional_summary || '' // renamed
  };
}

/**
 * Normalize a score breakdown from any format to the current format
 */
export function normalizeScoreBreakdown(breakdown: CVScoreBreakdown | LegacyCVScoreBreakdown | null | undefined): CVScoreBreakdown | null {
  if (!breakdown) return null;
  
  // Helper to normalize a score category
  const normalizeCategory = (value: ScoreCategory | number | undefined, defaultMax: number): ScoreCategory | number => {
    if (value === undefined) return { score: 0, max: defaultMax };
    return value;
  };
  
  // Check if it's in current format (has skills_relevance)
  if ('skills_relevance' in breakdown) {
    return breakdown as CVScoreBreakdown;
  }
  
  // Convert from legacy format
  const legacy = breakdown as LegacyCVScoreBreakdown;
  
  return {
    completeness: normalizeCategory(legacy.completeness, 20),
    skills_relevance: normalizeCategory(legacy.skills_depth, 20), // renamed
    experience_depth: normalizeCategory(legacy.experience_quality, 25), // renamed
    achievements: normalizeCategory(legacy.achievements, 15),
    education: normalizeCategory(legacy.education, 10),
    presentation: normalizeCategory(legacy.presentation, 10),
    summary: undefined
  };
}

// ============================================================================
// Parsed CV Types
// ============================================================================

export interface ParsedCVData {
  name: string;
  email: string;
  phone: string;
  job_title: string;
  sector: string;
  location: string;
  skills: string;
  experience_summary: string;
  years_experience: number | null;
  education_level: string;
  seniority_level: string;
  ai_profile: AIProfile | null;
  cv_score: number | null;
  cv_score_breakdown: CVScoreBreakdown | null;
}

export interface ParsedCV {
  id: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  status: 'pending' | 'parsing' | 'parsed' | 'error';
  error?: string;
  data: ParsedCVData;
}

// ============================================================================
// Import Session Types
// ============================================================================

export interface ImportSession {
  id: string;
  status: string;
  total_files: number;
  parsed_count: number;
  imported_count: number;
  failed_count: number;
  created_at: string;
}
