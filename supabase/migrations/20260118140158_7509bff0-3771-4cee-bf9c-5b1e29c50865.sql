-- =====================================================
-- PHASE 1.1: Extend cv_submissions with candidate profile fields
-- =====================================================

-- Qualifications & Professional Status
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS qualifications jsonb DEFAULT '[]';
-- Structure: [{ "name": "ACCA", "body": "ACCA", "status": "Part Qualified", "exams_passed": 9, "exams_remaining": 4 }]

ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS professional_memberships text[];

-- Compensation & Availability
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS current_salary text;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS salary_expectation text;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS notice_period text;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS available_from date;

-- Right to Work & Visa Status
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS right_to_work text;
-- Values: "British Citizen", "EU Settled Status", "EU Pre-Settled Status", "ILR", "Work Visa", "Student Visa", "Graduate Visa", "Requires Sponsorship", "Other"

ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS visa_type text;
-- Values: "Skilled Worker", "Graduate", "Student", "Dependant", "Global Talent", "Other"

ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS visa_expiry_date date;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS requires_sponsorship boolean DEFAULT false;

-- Structured Employment History (AI-extracted)
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS employment_history jsonb DEFAULT '[]';
-- Structure: [{ "company": "...", "role": "...", "start_date": "2020-01", "end_date": "2023-05", "sector": "Finance", "is_current": false }]

ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS role_changes_5yr integer;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS sector_exposure text[];

-- GDPR Compliance Fields
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS last_contact_date timestamptz;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS consent_given_at timestamptz;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS consent_expires_at timestamptz;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS anonymised_at timestamptz;
ALTER TABLE cv_submissions ADD COLUMN IF NOT EXISTS gdpr_notes text;

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_cv_submissions_right_to_work ON cv_submissions(right_to_work);
CREATE INDEX IF NOT EXISTS idx_cv_submissions_requires_sponsorship ON cv_submissions(requires_sponsorship);
CREATE INDEX IF NOT EXISTS idx_cv_submissions_last_contact_date ON cv_submissions(last_contact_date);
CREATE INDEX IF NOT EXISTS idx_cv_submissions_sector_exposure ON cv_submissions USING GIN(sector_exposure);

-- =====================================================
-- PHASE 1.2: Extend candidate_pipeline with stage tracking
-- =====================================================

ALTER TABLE candidate_pipeline ADD COLUMN IF NOT EXISTS stage_entered_at timestamptz DEFAULT now();
ALTER TABLE candidate_pipeline ADD COLUMN IF NOT EXISTS interview_feedback text;
ALTER TABLE candidate_pipeline ADD COLUMN IF NOT EXISTS salary_confirmed numeric;
ALTER TABLE candidate_pipeline ADD COLUMN IF NOT EXISTS interview_scheduled_at timestamptz;
ALTER TABLE candidate_pipeline ADD COLUMN IF NOT EXISTS offer_details jsonb;
-- Structure: { "salary": 50000, "bonus": 5000, "benefits": "...", "start_date": "2024-03-01" }

ALTER TABLE candidate_pipeline ADD COLUMN IF NOT EXISTS stage_requirements_met jsonb DEFAULT '{}';
-- Tracks which mandatory requirements have been completed for each stage transition

-- =====================================================
-- PHASE 1.3: Create interview_scorecards table
-- =====================================================

CREATE TABLE IF NOT EXISTS interview_scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES candidate_pipeline(id) ON DELETE CASCADE NOT NULL,
  stage text NOT NULL,
  
  -- Interview Details
  interviewer_name text,
  interviewer_role text,
  interview_date timestamptz,
  interview_type text DEFAULT 'in_person',
  -- Values: "phone", "video", "in_person", "assessment"
  
  -- Scoring (1-5 scale)
  technical_skills integer CHECK (technical_skills IS NULL OR (technical_skills >= 1 AND technical_skills <= 5)),
  communication integer CHECK (communication IS NULL OR (communication >= 1 AND communication <= 5)),
  cultural_fit integer CHECK (cultural_fit IS NULL OR (cultural_fit >= 1 AND cultural_fit <= 5)),
  motivation integer CHECK (motivation IS NULL OR (motivation >= 1 AND motivation <= 5)),
  experience_relevance integer CHECK (experience_relevance IS NULL OR (experience_relevance >= 1 AND experience_relevance <= 5)),
  overall_impression integer CHECK (overall_impression IS NULL OR (overall_impression >= 1 AND overall_impression <= 5)),
  
  -- Detailed Feedback
  strengths text,
  concerns text,
  notes text,
  questions_asked text,
  candidate_questions text,
  
  -- Recommendation
  recommendation text CHECK (recommendation IS NULL OR recommendation IN ('strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire')),
  next_steps text,
  
  -- Metadata
  is_client_feedback boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE interview_scorecards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview_scorecards
CREATE POLICY "Staff with pipeline.view can view scorecards"
  ON interview_scorecards FOR SELECT
  USING (is_full_admin(auth.uid()) OR has_permission(auth.uid(), 'pipeline.view'::permission_type));

CREATE POLICY "Staff with pipeline.create can insert scorecards"
  ON interview_scorecards FOR INSERT
  WITH CHECK (is_full_admin(auth.uid()) OR has_permission(auth.uid(), 'pipeline.create'::permission_type) OR has_permission(auth.uid(), 'pipeline.update'::permission_type));

CREATE POLICY "Staff with pipeline.update can update scorecards"
  ON interview_scorecards FOR UPDATE
  USING (is_full_admin(auth.uid()) OR has_permission(auth.uid(), 'pipeline.update'::permission_type));

CREATE POLICY "Full admins can delete scorecards"
  ON interview_scorecards FOR DELETE
  USING (is_full_admin(auth.uid()));

-- Indexes for interview_scorecards
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_pipeline_id ON interview_scorecards(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_stage ON interview_scorecards(stage);
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_interview_date ON interview_scorecards(interview_date);

-- =====================================================
-- PHASE 1.4: Create placements table
-- =====================================================

CREATE TABLE IF NOT EXISTS placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES candidate_pipeline(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Placement Details
  start_date date NOT NULL,
  actual_start_date date,
  job_type text NOT NULL DEFAULT 'permanent' CHECK (job_type IN ('permanent', 'contract', 'temp_to_perm', 'interim')),
  
  -- Candidate & Job Info (denormalized for reporting)
  candidate_name text,
  job_title text,
  company_name text,
  
  -- Financials
  salary numeric,
  day_rate numeric,
  fee_percentage numeric CHECK (fee_percentage IS NULL OR (fee_percentage >= 0 AND fee_percentage <= 100)),
  fee_value numeric,
  fee_currency text DEFAULT 'GBP',
  
  -- Invoicing
  invoice_date date,
  invoice_number text,
  invoice_raised boolean DEFAULT false,
  invoice_raised_at timestamptz,
  invoice_paid boolean DEFAULT false,
  invoice_paid_at timestamptz,
  payment_terms_days integer DEFAULT 30,
  
  -- Rebate/Guarantee
  guarantee_period_days integer DEFAULT 90,
  guarantee_expires_at date,
  rebate_triggered boolean DEFAULT false,
  rebate_trigger_date date,
  rebate_reason text,
  rebate_amount numeric,
  rebate_percentage numeric,
  
  -- Ownership & Attribution
  placed_by uuid REFERENCES auth.users(id),
  sourced_by uuid REFERENCES auth.users(id),
  split_with uuid REFERENCES auth.users(id),
  split_percentage numeric DEFAULT 100 CHECK (split_percentage >= 0 AND split_percentage <= 100),
  
  -- Status Tracking
  status text DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'started', 'completed', 'cancelled', 'rebate', 'no_show')),
  status_changed_at timestamptz DEFAULT now(),
  
  -- Notes
  notes text,
  internal_notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for placements
CREATE POLICY "Staff with pipeline.view can view placements"
  ON placements FOR SELECT
  USING (is_full_admin(auth.uid()) OR has_permission(auth.uid(), 'pipeline.view'::permission_type));

CREATE POLICY "Staff with pipeline.create can insert placements"
  ON placements FOR INSERT
  WITH CHECK (is_full_admin(auth.uid()) OR has_permission(auth.uid(), 'pipeline.create'::permission_type));

CREATE POLICY "Staff with pipeline.update can update placements"
  ON placements FOR UPDATE
  USING (is_full_admin(auth.uid()) OR has_permission(auth.uid(), 'pipeline.update'::permission_type));

CREATE POLICY "Full admins can delete placements"
  ON placements FOR DELETE
  USING (is_full_admin(auth.uid()));

-- Indexes for placements
CREATE INDEX IF NOT EXISTS idx_placements_pipeline_id ON placements(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_placements_start_date ON placements(start_date);
CREATE INDEX IF NOT EXISTS idx_placements_placed_by ON placements(placed_by);
CREATE INDEX IF NOT EXISTS idx_placements_status ON placements(status);
CREATE INDEX IF NOT EXISTS idx_placements_invoice_date ON placements(invoice_date);
CREATE INDEX IF NOT EXISTS idx_placements_guarantee_expires_at ON placements(guarantee_expires_at);

-- =====================================================
-- PHASE 1.5: Create trigger for updated_at on new tables
-- =====================================================

CREATE TRIGGER update_interview_scorecards_updated_at
  BEFORE UPDATE ON interview_scorecards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_placements_updated_at
  BEFORE UPDATE ON placements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PHASE 1.6: Create stage_entered_at update trigger for pipeline
-- =====================================================

CREATE OR REPLACE FUNCTION update_pipeline_stage_entered_at()
  RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage IS DISTINCT FROM OLD.stage THEN
    NEW.stage_entered_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pipeline_stage_entered_at_trigger
  BEFORE UPDATE ON candidate_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_stage_entered_at();