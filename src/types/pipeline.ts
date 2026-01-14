// Pipeline stage definitions
export const PIPELINE_STAGES = [
  'sourced',
  'screening',
  'shortlisted',
  'interviewing',
  'offered',
  'placed',
  'rejected',
  'withdrawn',
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number];

// Stage configuration for UI display
export interface StageConfig {
  id: PipelineStage;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

export const STAGE_CONFIG: Record<PipelineStage, StageConfig> = {
  sourced: {
    id: 'sourced',
    label: 'Sourced',
    description: 'Candidates added to the pipeline',
    color: 'border-slate-400',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    icon: 'Search',
  },
  screening: {
    id: 'screening',
    label: 'Screening',
    description: 'Initial review in progress',
    color: 'border-blue-400',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: 'Eye',
  },
  shortlisted: {
    id: 'shortlisted',
    label: 'Shortlisted',
    description: 'Selected for client presentation',
    color: 'border-purple-400',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: 'Star',
  },
  interviewing: {
    id: 'interviewing',
    label: 'Interviewing',
    description: 'In interview process',
    color: 'border-amber-400',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: 'Users',
  },
  offered: {
    id: 'offered',
    label: 'Offered',
    description: 'Offer extended to candidate',
    color: 'border-emerald-400',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    icon: 'FileCheck',
  },
  placed: {
    id: 'placed',
    label: 'Placed',
    description: 'Successfully placed',
    color: 'border-green-500',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: 'CheckCircle',
  },
  rejected: {
    id: 'rejected',
    label: 'Rejected',
    description: 'Not progressing further',
    color: 'border-red-400',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: 'XCircle',
  },
  withdrawn: {
    id: 'withdrawn',
    label: 'Withdrawn',
    description: 'Candidate withdrew',
    color: 'border-gray-400',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: 'UserMinus',
  },
};

// Active stages (not terminal)
export const ACTIVE_STAGES: PipelineStage[] = [
  'sourced',
  'screening',
  'shortlisted',
  'interviewing',
  'offered',
];

// Terminal stages
export const TERMINAL_STAGES: PipelineStage[] = ['placed', 'rejected', 'withdrawn'];

// Database types
export interface CandidatePipeline {
  id: string;
  cv_submission_id: string;
  job_id: string;
  stage: PipelineStage;
  assigned_to: string | null;
  notes: string | null;
  rejection_reason: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface PipelineActivity {
  id: string;
  pipeline_id: string;
  action: 'created' | 'stage_change' | 'note_added' | 'assigned' | 'priority_changed' | 'rejected' | 'withdrawn';
  from_stage: string | null;
  to_stage: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

// Extended types with joined data
export interface PipelineEntryWithDetails extends CandidatePipeline {
  cv_submission: {
    id: string;
    name: string;
    email: string;
    phone: string;
    job_title: string | null;
    cv_score: number | null;
    cv_file_url: string | null;
    location: string | null;
    years_experience: number | null;
  };
  job: {
    id: string;
    title: string;
    reference_id: string;
    location: string;
    sector: string;
  };
  assigned_user?: {
    display_name: string | null;
    email: string;
  } | null;
}

// Form types
export interface AddToPipelineData {
  cv_submission_id: string;
  job_id: string;
  stage?: PipelineStage;
  notes?: string;
  priority?: number;
}

export interface UpdatePipelineStageData {
  id: string;
  stage: PipelineStage;
  note?: string;
  rejection_reason?: string;
}

export interface UpdatePipelineNotesData {
  id: string;
  notes: string;
}

export interface AssignPipelineData {
  id: string;
  assigned_to: string | null;
}

// Filter types
export interface PipelineFilters {
  jobId?: string;
  stage?: PipelineStage;
  assignedTo?: string;
  search?: string;
}

// Stats types
export interface PipelineStats {
  total: number;
  byStage: Record<PipelineStage, number>;
  placedThisMonth: number;
  averageTimeToPlace: number | null;
}
