/**
 * Candidate Profile Types
 * Extended types for the full candidate profile view
 */

import type { AIProfile, CVScoreBreakdown } from './cv';

// ============================================================================
// Work Authorization Types
// ============================================================================

export type RightToWork =
  | 'British Citizen'
  | 'EU Settled Status'
  | 'EU Pre-Settled Status'
  | 'ILR'
  | 'Work Visa'
  | 'Student Visa'
  | 'Graduate Visa'
  | 'Requires Sponsorship'
  | 'Other';

export type VisaType =
  | 'Skilled Worker'
  | 'Graduate'
  | 'Student'
  | 'Dependant'
  | 'Global Talent'
  | 'Other';

export const RIGHT_TO_WORK_OPTIONS: { value: RightToWork; label: string; requiresVisa: boolean }[] = [
  { value: 'British Citizen', label: 'British Citizen', requiresVisa: false },
  { value: 'EU Settled Status', label: 'EU Settled Status', requiresVisa: false },
  { value: 'EU Pre-Settled Status', label: 'EU Pre-Settled Status', requiresVisa: false },
  { value: 'ILR', label: 'Indefinite Leave to Remain (ILR)', requiresVisa: false },
  { value: 'Work Visa', label: 'Work Visa', requiresVisa: true },
  { value: 'Student Visa', label: 'Student Visa', requiresVisa: true },
  { value: 'Graduate Visa', label: 'Graduate Visa', requiresVisa: true },
  { value: 'Requires Sponsorship', label: 'Requires Sponsorship', requiresVisa: true },
  { value: 'Other', label: 'Other', requiresVisa: false },
];

export const VISA_TYPE_OPTIONS: { value: VisaType; label: string }[] = [
  { value: 'Skilled Worker', label: 'Skilled Worker Visa' },
  { value: 'Graduate', label: 'Graduate Visa' },
  { value: 'Student', label: 'Student Visa' },
  { value: 'Dependant', label: 'Dependant Visa' },
  { value: 'Global Talent', label: 'Global Talent Visa' },
  { value: 'Other', label: 'Other' },
];

// ============================================================================
// Qualification Types
// ============================================================================

export type QualificationStatus = 'Qualified' | 'Part Qualified' | 'Studying' | 'Exempt';

export interface Qualification {
  name: string;
  body: string; // ACCA, ACA (ICAEW), CIMA, CFA, etc.
  status: QualificationStatus;
  exams_passed?: number;
  exams_remaining?: number;
  completion_date?: string;
  details?: string;
}

export const QUALIFICATION_BODIES = [
  { value: 'ACCA', label: 'ACCA' },
  { value: 'ACA', label: 'ACA (ICAEW)' },
  { value: 'CIMA', label: 'CIMA' },
  { value: 'CFA', label: 'CFA Institute' },
  { value: 'CIPD', label: 'CIPD' },
  { value: 'AAT', label: 'AAT' },
  { value: 'FCA', label: 'FCA' },
  { value: 'Other', label: 'Other' },
];

// ============================================================================
// Employment History Types
// ============================================================================

export interface EmploymentEntry {
  company: string;
  role: string;
  start_date: string; // YYYY-MM format
  end_date: string | null;
  sector: string;
  is_current: boolean;
  location?: string;
  responsibilities?: string;
}

// ============================================================================
// GDPR Types
// ============================================================================

export interface GDPRStatus {
  last_contact_date: string | null;
  consent_given_at: string | null;
  consent_expires_at: string | null;
  anonymised_at: string | null;
  gdpr_notes: string | null;
}

export type GDPRAction = 'update_contact' | 'renew_consent' | 'anonymise' | 'delete';

// Calculated GDPR status type (returned from calculateGDPRStatus)
export interface CalculatedGDPRStatus {
  status: 'active' | 'stale' | 'at_risk' | 'expired';
  label: string;
  color: string;
  daysSinceContact: number | null;
  daysUntilExpiry: number | null;
}

// Calculate GDPR status based on last contact date
export function calculateGDPRStatus(lastContactDate: string | null): CalculatedGDPRStatus {
  const maxDays = 730; // 2 years
  
  if (!lastContactDate) {
    return {
      status: 'expired',
      label: 'No Contact Date',
      color: 'text-gray-500',
      daysSinceContact: null,
      daysUntilExpiry: null,
    };
  }

  const days = Math.floor(
    (Date.now() - new Date(lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = maxDays - days;

  if (days <= 180) {
    return { status: 'active', label: 'Active', color: 'text-green-600', daysSinceContact: days, daysUntilExpiry: daysRemaining };
  } else if (days <= 365) {
    return { status: 'stale', label: 'Stale', color: 'text-amber-600', daysSinceContact: days, daysUntilExpiry: daysRemaining };
  } else if (days <= 730) {
    return { status: 'at_risk', label: 'At Risk', color: 'text-orange-600', daysSinceContact: days, daysUntilExpiry: daysRemaining };
  } else {
    return { status: 'expired', label: 'Expired', color: 'text-red-600', daysSinceContact: days, daysUntilExpiry: 0 };
  }
}

// ============================================================================
// Full Candidate Profile
// ============================================================================

export interface CandidateProfile {
  // Core identification
  id: string;
  name: string;
  email: string;
  phone: string;
  
  // CV Data
  cv_file_url: string | null;
  source: string | null;
  created_at: string;
  
  // Professional Summary
  job_title: string | null;
  sector: string | null;
  location: string | null;
  years_experience: number | null;
  seniority_level: string | null;
  
  // Skills & Profile
  skills: string | null;
  experience_summary: string | null;
  education_level: string | null;
  ai_profile: AIProfile | null;
  cv_score: number | null;
  cv_score_breakdown: CVScoreBreakdown | null;
  
  // Qualifications
  qualifications: Qualification[];
  professional_memberships: string[];
  
  // Compensation & Availability
  current_salary: string | null;
  salary_expectation: string | null;
  notice_period: string | null;
  available_from: string | null;
  
  // Work Authorization
  right_to_work: RightToWork | null;
  visa_type: VisaType | null;
  visa_expiry_date: string | null;
  requires_sponsorship: boolean;
  
  // Employment History (AI-extracted)
  employment_history: EmploymentEntry[];
  role_changes_5yr: number | null;
  sector_exposure: string[];
  
  // GDPR
  last_contact_date: string | null;
  consent_given_at: string | null;
  consent_expires_at: string | null;
  anonymised_at: string | null;
  gdpr_notes: string | null;
  
  // Admin
  admin_notes: string | null;
  added_by: string | null;
  potential_duplicate_of: string | null;
}

// ============================================================================
// Duplicate Detection Types
// ============================================================================

export interface DuplicateCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  cv_file_url: string | null;
  created_at: string;
  source: string | null;
  match_reason: 'email' | 'phone' | 'cv_content';
  similarity_score?: number;
}

export interface DuplicateGroup {
  primary: CandidateProfile;
  duplicates: DuplicateCandidate[];
}

// ============================================================================
// Form Types
// ============================================================================

export interface UpdateCandidateProfileData {
  // Work Authorization
  right_to_work?: RightToWork | null;
  visa_type?: VisaType | null;
  visa_expiry_date?: string | null;
  requires_sponsorship?: boolean;
  
  // Compensation & Availability
  current_salary?: string | null;
  salary_expectation?: string | null;
  notice_period?: string | null;
  available_from?: string | null;
  
  // Qualifications
  qualifications?: Qualification[];
  professional_memberships?: string[];
  
  // Employment History
  employment_history?: EmploymentEntry[];
  role_changes_5yr?: number | null;
  sector_exposure?: string[];
  
  // GDPR
  last_contact_date?: string | null;
  consent_given_at?: string | null;
  gdpr_notes?: string | null;
  
  // Admin
  admin_notes?: string | null;
  job_title?: string | null;
  sector?: string | null;
  location?: string | null;
  seniority_level?: string | null;
  years_experience?: number | null;
  skills?: string | null;
  experience_summary?: string | null;
}

// ============================================================================
// Notice Period Options
// ============================================================================

export const NOTICE_PERIOD_OPTIONS = [
  { value: 'Immediate', label: 'Immediate' },
  { value: '1 week', label: '1 Week' },
  { value: '2 weeks', label: '2 Weeks' },
  { value: '1 month', label: '1 Month' },
  { value: '2 months', label: '2 Months' },
  { value: '3 months', label: '3 Months' },
  { value: '6 months', label: '6 Months' },
  { value: 'Other', label: 'Other' },
];

// ============================================================================
// Seniority Level Options
// ============================================================================

export const SENIORITY_LEVEL_OPTIONS = [
  { value: 'Entry Level', label: 'Entry Level' },
  { value: 'Graduate', label: 'Graduate' },
  { value: 'Junior', label: 'Junior' },
  { value: 'Mid-Level', label: 'Mid-Level' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Director', label: 'Director' },
  { value: 'VP', label: 'VP' },
  { value: 'C-Level', label: 'C-Level' },
];
