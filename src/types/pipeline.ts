// ============================================================================
// Pipeline Stage Definitions
// ============================================================================

/**
 * Full lifecycle stages for the recruitment pipeline
 * Ordered from initial contact to final outcome
 */
export const PIPELINE_STAGES = [
  'sourced',      // Initial add to pipeline
  'contacted',    // First contact made
  'qualified',    // Screened and qualified
  'submitted',    // CV submitted to client
  'interview_1',  // First interview
  'interview_2',  // Second interview
  'final_interview', // Final round interview
  'offer',        // Offer extended
  'accepted',     // Offer accepted
  'placed',       // Successfully placed
  'rejected',     // Rejected (by client or candidate)
  'on_hold',      // Temporarily on hold
  'withdrawn',    // Candidate withdrew
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number];

// ============================================================================
// Stage Configuration
// ============================================================================

export interface StageConfig {
  id: PipelineStage;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  order: number;
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
    order: 0,
  },
  contacted: {
    id: 'contacted',
    label: 'Contacted',
    description: 'Initial contact made with candidate',
    color: 'border-sky-400',
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-700',
    icon: 'Phone',
    order: 1,
  },
  qualified: {
    id: 'qualified',
    label: 'Qualified',
    description: 'Screened and qualified for role',
    color: 'border-blue-400',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: 'CheckCircle',
    order: 2,
  },
  submitted: {
    id: 'submitted',
    label: 'Submitted',
    description: 'CV sent to client',
    color: 'border-violet-400',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-700',
    icon: 'Send',
    order: 3,
  },
  interview_1: {
    id: 'interview_1',
    label: 'Interview 1',
    description: 'First interview scheduled/completed',
    color: 'border-purple-400',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: 'Users',
    order: 4,
  },
  interview_2: {
    id: 'interview_2',
    label: 'Interview 2',
    description: 'Second interview scheduled/completed',
    color: 'border-fuchsia-400',
    bgColor: 'bg-fuchsia-100',
    textColor: 'text-fuchsia-700',
    icon: 'Users',
    order: 5,
  },
  final_interview: {
    id: 'final_interview',
    label: 'Final Interview',
    description: 'Final round interview',
    color: 'border-pink-400',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    icon: 'Award',
    order: 6,
  },
  offer: {
    id: 'offer',
    label: 'Offer',
    description: 'Offer extended to candidate',
    color: 'border-amber-400',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: 'FileText',
    order: 7,
  },
  accepted: {
    id: 'accepted',
    label: 'Accepted',
    description: 'Candidate accepted offer',
    color: 'border-lime-400',
    bgColor: 'bg-lime-100',
    textColor: 'text-lime-700',
    icon: 'ThumbsUp',
    order: 8,
  },
  placed: {
    id: 'placed',
    label: 'Placed',
    description: 'Successfully placed',
    color: 'border-green-500',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: 'CheckCircle2',
    order: 9,
  },
  rejected: {
    id: 'rejected',
    label: 'Rejected',
    description: 'Not progressing further',
    color: 'border-red-400',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: 'XCircle',
    order: 10,
  },
  on_hold: {
    id: 'on_hold',
    label: 'On Hold',
    description: 'Temporarily paused',
    color: 'border-orange-400',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: 'Pause',
    order: 11,
  },
  withdrawn: {
    id: 'withdrawn',
    label: 'Withdrawn',
    description: 'Candidate withdrew from process',
    color: 'border-gray-400',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: 'UserMinus',
    order: 12,
  },
};

// Active stages (in progress)
export const ACTIVE_STAGES: PipelineStage[] = [
  'sourced',
  'contacted',
  'qualified',
  'submitted',
  'interview_1',
  'interview_2',
  'final_interview',
  'offer',
  'accepted',
];

// Terminal stages (final outcomes)
export const TERMINAL_STAGES: PipelineStage[] = ['placed', 'rejected', 'on_hold', 'withdrawn'];

// Interview stages (require scorecards)
export const INTERVIEW_STAGES: PipelineStage[] = ['interview_1', 'interview_2', 'final_interview'];

// ============================================================================
// Mandatory Stage Actions
// ============================================================================

export interface RequiredField {
  field: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'select' | 'checkbox' | 'scorecard' | 'placement';
  required: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
}

export interface StageRequirements {
  /** Fields required when entering this stage */
  requiredFields: RequiredField[];
  /** Whether a scorecard is required from the previous stage */
  requiresPreviousScorecard?: boolean;
  /** Custom validation message */
  validationMessage?: string;
}

/**
 * Mandatory actions/fields when transitioning to each stage
 * These ensure proper data capture throughout the recruitment lifecycle
 */
export const STAGE_REQUIRED_ACTIONS: Partial<Record<PipelineStage, StageRequirements>> = {
  contacted: {
    requiredFields: [
      {
        field: 'contact_note',
        label: 'Contact Notes',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the initial contact (method, outcome, candidate response)...',
        helpText: 'Record details of the first contact with the candidate',
      },
    ],
  },
  qualified: {
    requiredFields: [
      {
        field: 'salary_confirmed',
        label: 'Salary Expectation (£)',
        type: 'number',
        required: true,
        placeholder: '50000',
        helpText: 'Confirmed salary expectation from the candidate',
      },
      {
        field: 'availability_confirmed',
        label: 'Availability / Notice Period',
        type: 'text',
        required: true,
        placeholder: 'e.g., Immediate, 1 month notice',
        helpText: 'When can the candidate start?',
      },
      {
        field: 'qualification_notes',
        label: 'Qualification Summary',
        type: 'textarea',
        required: true,
        placeholder: 'Summary of screening call, key strengths, concerns...',
      },
    ],
  },
  submitted: {
    requiredFields: [
      {
        field: 'submission_note',
        label: 'Submission Notes',
        type: 'textarea',
        required: true,
        placeholder: 'Why is this candidate being submitted? Key selling points...',
      },
      {
        field: 'client_contact',
        label: 'Submitted To',
        type: 'text',
        required: false,
        placeholder: 'Client contact name (optional)',
      },
    ],
  },
  interview_1: {
    requiredFields: [
      {
        field: 'interview_date',
        label: 'Interview Date & Time',
        type: 'datetime',
        required: true,
      },
      {
        field: 'interviewer',
        label: 'Interviewer(s)',
        type: 'text',
        required: true,
        placeholder: 'Name(s) of interviewer(s)',
      },
      {
        field: 'interview_type',
        label: 'Interview Type',
        type: 'select',
        required: true,
        options: [
          { value: 'phone', label: 'Phone' },
          { value: 'video', label: 'Video Call' },
          { value: 'in_person', label: 'In Person' },
          { value: 'assessment', label: 'Assessment' },
        ],
      },
    ],
  },
  interview_2: {
    requiredFields: [
      {
        field: 'interview_date',
        label: 'Interview Date & Time',
        type: 'datetime',
        required: true,
      },
      {
        field: 'interviewer',
        label: 'Interviewer(s)',
        type: 'text',
        required: true,
        placeholder: 'Name(s) of interviewer(s)',
      },
    ],
    requiresPreviousScorecard: true,
    validationMessage: 'Please complete the Interview 1 scorecard before proceeding',
  },
  final_interview: {
    requiredFields: [
      {
        field: 'interview_date',
        label: 'Interview Date & Time',
        type: 'datetime',
        required: true,
      },
      {
        field: 'interviewer',
        label: 'Interviewer(s)',
        type: 'text',
        required: true,
        placeholder: 'Name(s) of interviewer(s)',
      },
    ],
    requiresPreviousScorecard: true,
    validationMessage: 'Please complete previous interview scorecards before proceeding',
  },
  offer: {
    requiredFields: [
      {
        field: 'offer_salary',
        label: 'Offer Salary (£)',
        type: 'number',
        required: true,
        placeholder: '55000',
      },
      {
        field: 'offer_details',
        label: 'Offer Details',
        type: 'textarea',
        required: true,
        placeholder: 'Include: base salary, bonus, benefits, start date, other terms...',
      },
      {
        field: 'offer_date',
        label: 'Offer Date',
        type: 'date',
        required: true,
      },
    ],
  },
  accepted: {
    requiredFields: [
      {
        field: 'acceptance_confirmation',
        label: 'Confirm Acceptance',
        type: 'checkbox',
        required: true,
        helpText: 'Confirm the candidate has formally accepted the offer',
      },
      {
        field: 'start_date',
        label: 'Agreed Start Date',
        type: 'date',
        required: true,
      },
    ],
  },
  placed: {
    requiredFields: [
      {
        field: 'placement_form',
        label: 'Placement Details',
        type: 'placement',
        required: true,
        helpText: 'Complete all placement details including fees and guarantee',
      },
    ],
    validationMessage: 'Please complete all placement details before marking as placed',
  },
  rejected: {
    requiredFields: [
      {
        field: 'rejection_reason',
        label: 'Rejection Reason',
        type: 'select',
        required: true,
        options: [
          { value: 'client_rejected', label: 'Client Rejected' },
          { value: 'not_suitable', label: 'Not Suitable for Role' },
          { value: 'failed_interview', label: 'Failed Interview' },
          { value: 'salary_mismatch', label: 'Salary Mismatch' },
          { value: 'location_issue', label: 'Location Issue' },
          { value: 'timing', label: 'Timing/Availability' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        field: 'rejection_notes',
        label: 'Rejection Notes',
        type: 'textarea',
        required: true,
        placeholder: 'Detailed reason for rejection...',
      },
      {
        field: 'rejection_stage',
        label: 'Stage Rejected At',
        type: 'select',
        required: false,
        options: [
          { value: 'cv', label: 'CV Stage' },
          { value: 'interview_1', label: 'First Interview' },
          { value: 'interview_2', label: 'Second Interview' },
          { value: 'final', label: 'Final Interview' },
          { value: 'offer', label: 'Offer Stage' },
        ],
      },
    ],
  },
  on_hold: {
    requiredFields: [
      {
        field: 'hold_reason',
        label: 'Reason for Hold',
        type: 'textarea',
        required: true,
        placeholder: 'Why is this on hold? Expected duration?',
      },
      {
        field: 'expected_resume_date',
        label: 'Expected Resume Date',
        type: 'date',
        required: false,
        helpText: 'When do you expect to resume this process?',
      },
    ],
  },
  withdrawn: {
    requiredFields: [
      {
        field: 'withdrawal_reason',
        label: 'Withdrawal Reason',
        type: 'select',
        required: true,
        options: [
          { value: 'accepted_other', label: 'Accepted Other Offer' },
          { value: 'counter_offer', label: 'Counter Offer Accepted' },
          { value: 'personal', label: 'Personal Reasons' },
          { value: 'salary', label: 'Salary Expectations Not Met' },
          { value: 'role_change', label: 'Role No Longer Suitable' },
          { value: 'relocation', label: 'Relocation Issues' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        field: 'withdrawal_notes',
        label: 'Withdrawal Notes',
        type: 'textarea',
        required: false,
        placeholder: 'Additional context...',
      },
    ],
  },
};

// ============================================================================
// Database Types
// ============================================================================

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
  // New fields from migration
  stage_entered_at: string | null;
  interview_feedback: string | null;
  salary_confirmed: number | null;
  interview_scheduled_at: string | null;
  offer_details: OfferDetails | null;
  stage_requirements_met: Record<string, unknown> | null;
}

export interface OfferDetails {
  salary?: number;
  bonus?: number;
  benefits?: string;
  start_date?: string;
  other_terms?: string;
}

export interface PipelineActivity {
  id: string;
  pipeline_id: string;
  action: 'created' | 'stage_change' | 'note_added' | 'assigned' | 'priority_changed' | 'rejected' | 'withdrawn' | 'scorecard_added' | 'placement_created';
  from_stage: string | null;
  to_stage: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

// ============================================================================
// Interview Scorecard Types
// ============================================================================

export type ScorecardRecommendation = 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
export type InterviewType = 'phone' | 'video' | 'in_person' | 'assessment';

export interface InterviewScorecard {
  id: string;
  pipeline_id: string;
  stage: PipelineStage;
  
  // Interview Details
  interviewer_name: string | null;
  interviewer_role: string | null;
  interview_date: string | null;
  interview_type: InterviewType;
  
  // Scores (1-5)
  technical_skills: number | null;
  communication: number | null;
  cultural_fit: number | null;
  motivation: number | null;
  experience_relevance: number | null;
  overall_impression: number | null;
  
  // Feedback
  strengths: string | null;
  concerns: string | null;
  notes: string | null;
  questions_asked: string | null;
  candidate_questions: string | null;
  
  // Recommendation
  recommendation: ScorecardRecommendation | null;
  next_steps: string | null;
  
  // Metadata
  is_client_feedback: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const RECOMMENDATION_CONFIG: Record<ScorecardRecommendation, { label: string; color: string; bgColor: string }> = {
  strong_hire: { label: 'Strong Hire', color: 'text-green-700', bgColor: 'bg-green-100' },
  hire: { label: 'Hire', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  maybe: { label: 'Maybe', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  no_hire: { label: 'No Hire', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  strong_no_hire: { label: 'Strong No Hire', color: 'text-red-700', bgColor: 'bg-red-100' },
};

// ============================================================================
// Placement Types
// ============================================================================

export type PlacementStatus = 'pending' | 'confirmed' | 'started' | 'completed' | 'cancelled' | 'rebate' | 'no_show';
export type JobType = 'permanent' | 'contract' | 'temp_to_perm' | 'interim';

export interface Placement {
  id: string;
  pipeline_id: string;
  
  // Placement Details
  start_date: string;
  actual_start_date: string | null;
  job_type: JobType;
  
  // Denormalized Info
  candidate_name: string | null;
  job_title: string | null;
  company_name: string | null;
  
  // Financials
  salary: number | null;
  day_rate: number | null;
  fee_percentage: number | null;
  fee_value: number | null;
  fee_currency: string;
  
  // Invoicing
  invoice_date: string | null;
  invoice_number: string | null;
  invoice_raised: boolean;
  invoice_raised_at: string | null;
  invoice_paid: boolean;
  invoice_paid_at: string | null;
  payment_terms_days: number;
  
  // Guarantee/Rebate
  guarantee_period_days: number;
  guarantee_expires_at: string | null;
  rebate_triggered: boolean;
  rebate_trigger_date: string | null;
  rebate_reason: string | null;
  rebate_amount: number | null;
  rebate_percentage: number | null;
  
  // Ownership
  placed_by: string | null;
  sourced_by: string | null;
  split_with: string | null;
  split_percentage: number;
  
  // Status
  status: PlacementStatus;
  status_changed_at: string | null;
  notes: string | null;
  internal_notes: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const PLACEMENT_STATUS_CONFIG: Record<PlacementStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-slate-700', bgColor: 'bg-slate-100' },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  started: { label: 'Started', color: 'text-green-700', bgColor: 'bg-green-100' },
  completed: { label: 'Completed', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  rebate: { label: 'Rebate', color: 'text-red-700', bgColor: 'bg-red-100' },
  no_show: { label: 'No Show', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

export const JOB_TYPE_CONFIG: Record<JobType, { label: string }> = {
  permanent: { label: 'Permanent' },
  contract: { label: 'Contract' },
  temp_to_perm: { label: 'Temp to Perm' },
  interim: { label: 'Interim' },
};

// ============================================================================
// Extended Types with Joined Data
// ============================================================================

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
    // New fields
    right_to_work: string | null;
    requires_sponsorship: boolean | null;
    current_salary: string | null;
    notice_period: string | null;
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
  // Related data
  scorecards?: InterviewScorecard[];
  placement?: Placement | null;
}

// ============================================================================
// Form Types
// ============================================================================

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
  /** Additional data captured during stage transition */
  stageData?: Record<string, unknown>;
}

export interface UpdatePipelineNotesData {
  id: string;
  notes: string;
}

export interface AssignPipelineData {
  id: string;
  assigned_to: string | null;
}

export interface CreateScorecardData {
  pipeline_id: string;
  stage: PipelineStage;
  interviewer_name?: string;
  interviewer_role?: string;
  interview_date?: string;
  interview_type?: InterviewType;
  technical_skills?: number;
  communication?: number;
  cultural_fit?: number;
  motivation?: number;
  experience_relevance?: number;
  overall_impression?: number;
  strengths?: string;
  concerns?: string;
  notes?: string;
  questions_asked?: string;
  candidate_questions?: string;
  recommendation?: ScorecardRecommendation;
  next_steps?: string;
  is_client_feedback?: boolean;
}

export interface CreatePlacementData {
  pipeline_id: string;
  start_date: string;
  job_type: JobType;
  candidate_name?: string;
  job_title?: string;
  company_name?: string;
  salary?: number;
  day_rate?: number;
  fee_percentage?: number;
  fee_value?: number;
  invoice_date?: string;
  guarantee_period_days?: number;
  placed_by?: string;
  sourced_by?: string;
  split_with?: string;
  split_percentage?: number;
  notes?: string;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface PipelineFilters {
  jobId?: string;
  stage?: PipelineStage;
  assignedTo?: string;
  search?: string;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface PipelineStats {
  total: number;
  byStage: Record<PipelineStage, number>;
  placedThisMonth: number;
  averageTimeToPlace: number | null;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a stage requires mandatory fields
 */
export function stageRequiresMandatoryFields(stage: PipelineStage): boolean {
  return stage in STAGE_REQUIRED_ACTIONS;
}

/**
 * Get required fields for a stage transition
 */
export function getStageRequirements(stage: PipelineStage): StageRequirements | null {
  return STAGE_REQUIRED_ACTIONS[stage] || null;
}

/**
 * Check if a stage is an interview stage
 */
export function isInterviewStage(stage: PipelineStage): boolean {
  return INTERVIEW_STAGES.includes(stage);
}

/**
 * Check if a stage is a terminal stage
 */
export function isTerminalStage(stage: PipelineStage): boolean {
  return TERMINAL_STAGES.includes(stage);
}

/**
 * Get the next logical stage in the pipeline
 */
export function getNextStage(currentStage: PipelineStage): PipelineStage | null {
  const currentOrder = STAGE_CONFIG[currentStage].order;
  const nextStage = ACTIVE_STAGES.find(s => STAGE_CONFIG[s].order === currentOrder + 1);
  return nextStage || null;
}

/**
 * Calculate average scorecard rating
 */
export function calculateAverageScore(scorecard: InterviewScorecard): number | null {
  const scores = [
    scorecard.technical_skills,
    scorecard.communication,
    scorecard.cultural_fit,
    scorecard.motivation,
    scorecard.experience_relevance,
    scorecard.overall_impression,
  ].filter((s): s is number => s !== null);
  
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
