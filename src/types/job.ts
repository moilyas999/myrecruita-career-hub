// Extended job types for the Job Management module
// Following industry standards for recruitment job tracking

import type { Tables } from '@/integrations/supabase/types';

// Status types from database enum
export type JobStatus = 'draft' | 'active' | 'on_hold' | 'filled' | 'closed';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export type JobTypeCategory = 'permanent' | 'contract' | 'temp' | 'ftc';
export type ClientResponseStatus = 'pending' | 'interested' | 'rejected' | 'interview' | 'offer' | 'placed';

// Base job type from database
export type JobRow = Tables<'jobs'>;

// Extended job with joined data
export interface Job extends JobRow {
  client?: {
    id: string;
    company_name: string;
    industry: string | null;
    status: string;
  } | null;
  hiring_manager?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
  } | null;
  assigned_to_user?: {
    id: string;
    display_name: string | null;
    email: string | null;
  } | null;
}

// Job with full details for detail page
export interface JobWithDetails extends Job {
  pipeline_count?: number;
  active_pipeline_count?: number;
  submission_count?: number;
  interview_count?: number;
  offer_count?: number;
}

// Job metrics aggregation
export interface JobMetrics {
  totalJobs: number;
  activeJobs: number;
  filledJobs: number;
  onHoldJobs: number;
  closedJobs: number;
  avgTimeToFill: number;
  totalCVsSubmitted: number;
  totalInterviews: number;
  totalOffers: number;
  conversionRate: number; // CVs to placements percentage
  projectedRevenue: number;
  confirmedRevenue: number;
}

// Role ageing data for dashboard
export interface RoleAgeingData {
  id: string;
  title: string;
  reference_id: string;
  client_id: string | null;
  client_name?: string;
  days_open: number;
  ageing_status: 'new' | 'normal' | 'ageing' | 'stale';
  priority: JobPriority | null;
  cvs_submitted_count: number;
}

// Rejection statistics
export interface RejectionStats {
  category: string;
  count: number;
  percentage: number;
}

// Time to fill trend data
export interface TimeToFillTrend {
  month: string;
  avgDays: number;
  targetDays: number;
  placementCount: number;
}

// Revenue forecast data
export interface RevenueForecastData {
  month: string;
  projected: number;
  confirmed: number;
  jobCount: number;
}

// Create job input (form data)
export interface CreateJobInput {
  title: string;
  location: string;
  sector: string;
  description: string;
  requirements: string;
  benefits?: string | null;
  salary?: string | null;
  status?: JobStatus;
  client_id?: string | null;
  hiring_manager_id?: string | null;
  priority?: JobPriority | null;
  job_type_category?: JobTypeCategory | null;
  fee_percentage?: number | null;
  revenue_forecast?: number | null;
  target_fill_date?: string | null;
  target_start_date?: string | null;
  time_to_fill_target_days?: number | null;
}

// Update job input
export interface UpdateJobInput extends Partial<CreateJobInput> {
  id: string;
}

// Job filters for list queries
export interface JobFilters {
  status?: JobStatus[];
  clientId?: string;
  priority?: JobPriority[];
  search?: string;
  sector?: string;
  assignedTo?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Job submission to client
export interface JobSubmission {
  id: string;
  job_id: string;
  candidate_id: string;
  submitted_at: string;
  submitted_by: string;
  client_response: ClientResponseStatus;
  client_feedback: string | null;
  rejection_category: string | null;
  rejection_reason: string | null;
  response_at: string | null;
  candidate?: {
    id: string;
    full_name: string;
    email: string;
    current_role: string | null;
    current_company: string | null;
  };
  submitted_by_user?: {
    id: string;
    display_name: string | null;
  };
}

// Interview data for job
export interface JobInterview {
  id: string;
  job_id: string;
  candidate_id: string;
  pipeline_id: string;
  interview_date: string;
  interview_type: string;
  interviewer_names: string[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  outcome: 'passed' | 'failed' | 'pending' | null;
  feedback: string | null;
  scorecard_id: string | null;
  candidate?: {
    id: string;
    full_name: string;
  };
}

// Pipeline candidate for job view
export interface JobPipelineCandidate {
  id: string;
  job_id: string;
  candidate_id: string;
  stage: string;
  status: string;
  added_at: string;
  moved_at: string;
  assigned_to: string | null;
  notes: string | null;
  candidate?: {
    id: string;
    full_name: string;
    email: string;
    current_role: string | null;
    current_company: string | null;
    location: string | null;
    ai_match_score: number | null;
  };
  assigned_to_user?: {
    display_name: string | null;
  };
}

// Job activity log entry
export interface JobActivity {
  id: string;
  job_id: string;
  action_type: string;
  action_description: string;
  performed_by: string;
  performed_at: string;
  metadata: Record<string, unknown> | null;
  performed_by_user?: {
    display_name: string | null;
  };
}

// Priority configuration for UI
export const PRIORITY_CONFIG: Record<JobPriority, { label: string; color: string; bgColor: string }> = {
  urgent: { label: 'Urgent', color: 'text-red-700', bgColor: 'bg-red-100' },
  high: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  medium: { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  low: { label: 'Low', color: 'text-green-700', bgColor: 'bg-green-100' },
};

// Job type category configuration
export const JOB_TYPE_CONFIG: Record<JobTypeCategory, { label: string; description: string }> = {
  permanent: { label: 'Permanent', description: 'Full-time permanent position' },
  contract: { label: 'Contract', description: 'Fixed-term contract role' },
  temp: { label: 'Temporary', description: 'Short-term temporary position' },
  ftc: { label: 'FTC', description: 'Fixed Term Contract' },
};

// Ageing status configuration
export const AGEING_CONFIG: Record<string, { label: string; color: string; bgColor: string; maxDays: number }> = {
  new: { label: 'New', color: 'text-green-700', bgColor: 'bg-green-100', maxDays: 7 },
  normal: { label: 'Normal', color: 'text-blue-700', bgColor: 'bg-blue-100', maxDays: 14 },
  ageing: { label: 'Ageing', color: 'text-yellow-700', bgColor: 'bg-yellow-100', maxDays: 30 },
  stale: { label: 'Stale', color: 'text-red-700', bgColor: 'bg-red-100', maxDays: Infinity },
};

// Rejection categories for analytics
export const REJECTION_CATEGORIES = [
  'skills_mismatch',
  'experience_level',
  'salary_expectations',
  'location_preference',
  'cultural_fit',
  'timing',
  'visa_status',
  'other',
] as const;

export type RejectionCategory = typeof REJECTION_CATEGORIES[number];

export const REJECTION_CATEGORY_LABELS: Record<RejectionCategory, string> = {
  skills_mismatch: 'Skills Mismatch',
  experience_level: 'Experience Level',
  salary_expectations: 'Salary Expectations',
  location_preference: 'Location Preference',
  cultural_fit: 'Cultural Fit',
  timing: 'Timing',
  visa_status: 'Visa/Work Authorization',
  other: 'Other',
};
