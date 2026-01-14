export interface JobApplication {
  id: string;
  job_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  cv_file_url?: string;
  created_at: string;
  jobs: {
    title: string;
    reference_id: string;
  };
}

export interface CVSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  cv_file_url: string;
  message: string;
  created_at: string;
  source?: string;
  job_title?: string;
  sector?: string;
  location?: string;
  admin_notes?: string;
  seniority_level?: string;
  cv_score?: number | null;
  cv_score_breakdown?: unknown;
}

export interface CareerPartnerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  message: string;
  created_at: string;
}

export interface TalentRequest {
  id: string;
  talent_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  message: string;
  created_at: string;
  talent_profiles: {
    reference_id: string;
    role: string;
  };
}

export interface EmployerJobSubmission {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  job_title: string;
  job_description: string;
  sector: string;
  location: string;
  job_spec_file_url?: string;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  inquiry_type: string;
  created_at: string;
}

export interface CVForPipeline {
  id: string;
  name: string;
  email: string;
  job_title?: string | null;
}
