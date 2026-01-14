/**
 * Shared Types for CV Matching System v2.0
 */

import type { ParsedJobRequirements } from './job-parser.ts';
import type { SkillMatchResult } from './skills-taxonomy.ts';
import type { LocationMatch } from './location-service.ts';

// ============================================================================
// Matching Weights
// ============================================================================

export interface MatchWeights {
  skills: number;        // default: 40
  experience: number;    // default: 25
  seniority: number;     // default: 20
  location: number;      // default: 15
  certifications: number; // optional boost
  education: number;     // optional boost
}

export const DEFAULT_WEIGHTS: MatchWeights = {
  skills: 40,
  experience: 25,
  seniority: 20,
  location: 15,
  certifications: 0,
  education: 0
};

// ============================================================================
// Candidate Types
// ============================================================================

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  job_title: string | null;
  sector: string | null;
  location: string | null;
  years_experience: number | null;
  skills: string | null;
  cv_score: number | null;
  cv_file_url: string | null;
  seniority_level: string | null;
  education_level: string | null;
  ai_profile: {
    summary_for_matching?: string;
    key_achievements?: string[];
    hard_skills?: string[];
    soft_skills?: string[];
    certifications?: string[];
    industries?: string[];
    experience_years?: number;
    seniority?: string;
    ideal_roles?: string[];
    career_progression?: string;
    education?: {
      level: string;
      field: string;
      institution: string;
    };
  } | null;
}

// ============================================================================
// Pre-Screening Result
// ============================================================================

export interface PreScreeningScore {
  candidateId: string;
  skillScore: number;
  experienceScore: number;
  seniorityScore: number;
  locationScore: number;
  totalScore: number;
  passesPreScreen: boolean;
  dealBreakerFailures: string[];
  skillMatchResult: SkillMatchResult;
  locationMatch: LocationMatch;
}

// ============================================================================
// AI Analysis Result
// ============================================================================

export interface AIAnalysisResult {
  cv_id: string;
  match_score: number;
  explanation: string;
  skills_matched: string[];
  skills_missing: string[];
  skills_partial: string[];
  strengths: string[];
  fit_concerns: string[];
  interview_questions: string[];
  overqualification_risk: 'none' | 'low' | 'medium' | 'high';
  career_trajectory_fit: 'poor' | 'moderate' | 'good' | 'excellent';
  salary_expectation_fit: 'below' | 'within' | 'above' | 'unknown';
}

// ============================================================================
// Final Match Result
// ============================================================================

export interface EnrichedMatchResult {
  cv_id: string;
  algorithmic_score: number;
  ai_score: number;
  final_score: number;
  
  // Skill analysis
  skills_matched: string[];
  skills_missing: string[];
  skills_partial: string[];
  
  // AI insights
  explanation: string;
  strengths: string[];
  fit_concerns: string[];
  interview_questions: string[];
  
  // Advanced signals
  overqualification_risk: string;
  career_trajectory_fit: string;
  salary_expectation_fit: string;
  
  // Candidate info
  candidate: {
    id: string;
    name: string;
    email: string;
    job_title: string | null;
    sector: string | null;
    location: string | null;
    years_experience: number | null;
    cv_score: number | null;
    cv_file_url: string | null;
  };
}

// ============================================================================
// Match Session
// ============================================================================

export interface MatchSession {
  id: string;
  jobDescription: string;
  parsedRequirements: ParsedJobRequirements | null;
  weights: MatchWeights;
  filters: MatchFilters;
  totalEvaluated: number;
  preScreenedCount: number;
  aiAnalyzedCount: number;
  processingTimeMs: number;
  results: EnrichedMatchResult[];
}

export interface MatchFilters {
  location?: string;
  sector?: string;
  minExperience?: number;
  maxResults?: number;
  includeRemote?: boolean;
}

// ============================================================================
// Seniority Mapping
// ============================================================================

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

export type SeniorityLevel = typeof SENIORITY_LEVELS[number];

export function getSeniorityIndex(level: string | null): number {
  if (!level) return 2; // Default to mid-level
  
  const normalized = level.toLowerCase().trim();
  
  const mapping: Record<string, number> = {
    'entry': 0, 'entry level': 0, 'entry-level': 0, 'graduate': 0, 'intern': 0,
    'junior': 1, 'jr': 1, 'associate': 1,
    'mid': 2, 'mid-level': 2, 'mid level': 2, 'intermediate': 2,
    'senior': 3, 'sr': 3, 'experienced': 3,
    'lead': 4, 'principal': 4, 'staff': 4,
    'manager': 5, 'mgr': 5, 'team lead': 5, 'supervisor': 5,
    'director': 6, 'head': 6, 'head of': 6,
    'vp': 7, 'vice president': 7, 'svp': 7, 'senior vice president': 7,
    'c-level': 8, 'c level': 8, 'chief': 8,
    'executive': 9, 'ceo': 9, 'cfo': 9, 'cto': 9, 'coo': 9, 'partner': 9
  };
  
  for (const [key, index] of Object.entries(mapping)) {
    if (normalized.includes(key)) {
      return index;
    }
  }
  
  return 2; // Default to mid-level
}

export function compareSeniority(candidateLevel: string | null, jobLevel: string | null): {
  score: number;
  description: string;
} {
  const candidateIndex = getSeniorityIndex(candidateLevel);
  const jobIndex = getSeniorityIndex(jobLevel);
  
  const diff = candidateIndex - jobIndex;
  
  if (diff === 0) {
    return { score: 100, description: 'Exact seniority match' };
  }
  if (diff === 1) {
    return { score: 85, description: 'Slightly more senior than required' };
  }
  if (diff === -1) {
    return { score: 80, description: 'Slightly less senior, could grow into role' };
  }
  if (diff >= 2) {
    return { score: 50, description: 'May be overqualified for this role' };
  }
  if (diff <= -2) {
    return { score: 40, description: 'May lack required seniority' };
  }
  
  return { score: 60, description: 'Seniority level differs' };
}

// ============================================================================
// Experience Matching
// ============================================================================

export function matchExperience(
  candidateYears: number | null,
  required: { min: number; max: number | null }
): { score: number; description: string } {
  const years = candidateYears || 0;
  
  // Exactly within range
  if (years >= required.min && (required.max === null || years <= required.max)) {
    return { score: 100, description: 'Experience within required range' };
  }
  
  // Slightly under (within 1 year)
  if (years >= required.min - 1 && years < required.min) {
    return { score: 80, description: 'Slightly less experience than required' };
  }
  
  // Moderately under (1-2 years)
  if (years >= required.min - 2 && years < required.min - 1) {
    return { score: 60, description: 'Less experience than preferred' };
  }
  
  // Over max (if specified)
  if (required.max !== null && years > required.max) {
    const overBy = years - required.max;
    if (overBy <= 2) {
      return { score: 85, description: 'Slightly more experienced than range' };
    }
    if (overBy <= 5) {
      return { score: 70, description: 'More experienced than typical for role' };
    }
    return { score: 50, description: 'May be overqualified based on experience' };
  }
  
  // Significantly under
  if (years < required.min - 2) {
    return { score: 30, description: 'Significantly less experience than required' };
  }
  
  return { score: 50, description: 'Experience level differs from requirements' };
}
