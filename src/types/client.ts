// Client CRM types - matching database schema

export type ClientStatus = 'active' | 'prospect' | 'inactive' | 'do_not_contact';
export type PSLStatus = 'target' | 'applied' | 'approved' | 'active' | 'lapsed' | 'declined';
export type CompanySize = 'startup' | 'sme' | 'enterprise' | 'multinational';
export type InteractionType = 'call' | 'email' | 'meeting' | 'linkedin' | 'note' | 'proposal';
export type InteractionDirection = 'inbound' | 'outbound';
export type ContactMethod = 'email' | 'phone' | 'mobile';
export type JobTypeCategory = 'permanent' | 'contract' | 'temp' | 'ftc';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ClientResponse = 'pending' | 'interested' | 'rejected' | 'interview';
export type RejectionCategory = 'skills' | 'experience' | 'salary' | 'location' | 'culture' | 'timing' | 'other';

export interface Client {
  id: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  company_size: CompanySize | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  logo_url: string | null;
  notes: string | null;
  account_manager_id: string | null;
  secondary_contact_id: string | null;
  source: string | null;
  psl_status: PSLStatus;
  psl_achieved_at: string | null;
  psl_expires_at: string | null;
  psl_notes: string | null;
  billing_email: string | null;
  billing_contact_name: string | null;
  vat_number: string | null;
  status: ClientStatus;
  last_contact_at: string | null;
  last_placement_at: string | null;
  total_placements: number;
  lifetime_revenue: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Joined data
  account_manager?: {
    id: string;
    display_name: string | null;
    email: string;
  } | null;
  contacts_count?: number;
  active_jobs_count?: number;
}

export interface ClientContact {
  id: string;
  client_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  job_title: string | null;
  department: string | null;
  is_primary: boolean;
  is_billing_contact: boolean;
  is_active: boolean;
  linkedin_url: string | null;
  notes: string | null;
  last_contact_at: string | null;
  preferred_contact_method: ContactMethod;
  created_at: string;
  updated_at: string;
}

export interface ClientTerms {
  id: string;
  client_id: string;
  name: string;
  job_type: JobTypeCategory;
  fee_percentage_perm: number | null;
  fee_percentage_contract: number | null;
  flat_fee: number | null;
  payment_terms_days: number;
  rebate_period_days: number;
  rebate_percentage: number;
  is_exclusive: boolean;
  min_salary_threshold: number | null;
  max_salary_cap: number | null;
  notes: string | null;
  is_active: boolean;
  effective_from: string;
  effective_until: string | null;
  created_at: string;
  created_by: string | null;
}

export interface ClientInteraction {
  id: string;
  client_id: string;
  contact_id: string | null;
  interaction_type: InteractionType;
  direction: InteractionDirection | null;
  subject: string | null;
  summary: string | null;
  outcome: string | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  duration_minutes: number | null;
  created_at: string;
  created_by: string | null;
  // Joined data
  contact?: ClientContact | null;
  created_by_user?: {
    display_name: string | null;
    email: string;
  } | null;
}

export interface JobSubmission {
  id: string;
  job_id: string;
  cv_submission_id: string;
  submitted_at: string;
  submitted_by: string | null;
  client_response: ClientResponse | null;
  client_responded_at: string | null;
  rejection_reason: string | null;
  rejection_category: RejectionCategory | null;
  notes: string | null;
  // Joined data
  cv_submission?: {
    id: string;
    name: string;
    email: string;
    job_title: string | null;
    cv_score: number | null;
  } | null;
  submitted_by_user?: {
    display_name: string | null;
    email: string;
  } | null;
}

export interface RejectionReason {
  id: string;
  category: string;
  reason: string;
  is_candidate_rejection: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// Form types for creating/updating
export interface CreateClientInput {
  company_name: string;
  website?: string;
  industry?: string;
  company_size?: CompanySize;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  source?: string;
  psl_status?: PSLStatus;
  status?: ClientStatus;
  billing_email?: string;
  billing_contact_name?: string;
  vat_number?: string;
  notes?: string;
  account_manager_id?: string;
}

export interface CreateContactInput {
  client_id: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  job_title?: string;
  department?: string;
  is_primary?: boolean;
  is_billing_contact?: boolean;
  linkedin_url?: string;
  notes?: string;
  preferred_contact_method?: ContactMethod;
}

export interface CreateTermsInput {
  client_id: string;
  name: string;
  job_type?: JobTypeCategory;
  fee_percentage_perm?: number;
  fee_percentage_contract?: number;
  flat_fee?: number;
  payment_terms_days?: number;
  rebate_period_days?: number;
  rebate_percentage?: number;
  is_exclusive?: boolean;
  min_salary_threshold?: number;
  max_salary_cap?: number;
  notes?: string;
  effective_from?: string;
  effective_until?: string;
}

export interface CreateInteractionInput {
  client_id: string;
  contact_id?: string;
  interaction_type: InteractionType;
  direction?: InteractionDirection;
  subject?: string;
  summary?: string;
  outcome?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  duration_minutes?: number;
}

export interface CreateJobSubmissionInput {
  job_id: string;
  cv_submission_id: string;
  notes?: string;
}

// Filter types
export interface ClientFilters {
  search?: string;
  status?: ClientStatus;
  psl_status?: PSLStatus;
  industry?: string;
  account_manager_id?: string;
}
