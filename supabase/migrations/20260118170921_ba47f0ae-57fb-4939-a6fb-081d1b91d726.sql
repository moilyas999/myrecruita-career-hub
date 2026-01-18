-- =============================================================
-- Phase 1B: Client CRM Module - Tables and Policies
-- =============================================================

-- 1. Create ENUM types for client-related statuses
CREATE TYPE client_status AS ENUM ('active', 'prospect', 'inactive', 'do_not_contact');
CREATE TYPE psl_status AS ENUM ('target', 'applied', 'approved', 'active', 'lapsed', 'declined');
CREATE TYPE company_size AS ENUM ('startup', 'sme', 'enterprise', 'multinational');
CREATE TYPE interaction_type AS ENUM ('call', 'email', 'meeting', 'linkedin', 'note', 'proposal');
CREATE TYPE interaction_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE contact_method AS ENUM ('email', 'phone', 'mobile');
CREATE TYPE job_type_enum AS ENUM ('permanent', 'contract', 'temp', 'ftc');
CREATE TYPE job_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 2. Create clients table (Core CRM)
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  company_size company_size,
  address TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'UK',
  logo_url TEXT,
  notes TEXT,
  
  -- Account management
  account_manager_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  secondary_contact_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  source TEXT,
  
  -- PSL (Preferred Supplier List) tracking
  psl_status psl_status DEFAULT 'target',
  psl_achieved_at TIMESTAMPTZ,
  psl_expires_at TIMESTAMPTZ,
  psl_notes TEXT,
  
  -- Billing information
  billing_email TEXT,
  billing_contact_name TEXT,
  vat_number TEXT,
  
  -- Status and activity tracking
  status client_status DEFAULT 'prospect',
  last_contact_at TIMESTAMPTZ,
  last_placement_at TIMESTAMPTZ,
  total_placements INTEGER DEFAULT 0,
  lifetime_revenue DECIMAL(12,2) DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. Create client_contacts table (Hiring managers & contacts)
CREATE TABLE public.client_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  job_title TEXT,
  department TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_billing_contact BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  linkedin_url TEXT,
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  preferred_contact_method contact_method DEFAULT 'email',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create client_terms table (Negotiated fee structures)
CREATE TABLE public.client_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_type job_type_enum DEFAULT 'permanent',
  fee_percentage_perm DECIMAL(5,2),
  fee_percentage_contract DECIMAL(5,2),
  flat_fee DECIMAL(10,2),
  payment_terms_days INTEGER DEFAULT 30,
  rebate_period_days INTEGER DEFAULT 90,
  rebate_percentage DECIMAL(5,2) DEFAULT 100,
  is_exclusive BOOLEAN DEFAULT false,
  min_salary_threshold DECIMAL(10,2),
  max_salary_cap DECIMAL(10,2),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 5. Create client_interactions table (Activity log)
CREATE TABLE public.client_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.client_contacts(id) ON DELETE SET NULL,
  interaction_type interaction_type NOT NULL,
  direction interaction_direction,
  subject TEXT,
  summary TEXT,
  outcome TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 6. Add client_id and enhanced fields to jobs table
ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hiring_manager_id UUID REFERENCES public.client_contacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS priority job_priority DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS job_type_category job_type_enum DEFAULT 'permanent',
  ADD COLUMN IF NOT EXISTS target_start_date DATE,
  ADD COLUMN IF NOT EXISTS target_fill_date DATE,
  ADD COLUMN IF NOT EXISTS time_to_fill_target_days INTEGER,
  ADD COLUMN IF NOT EXISTS placed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS time_to_fill_actual_days INTEGER,
  ADD COLUMN IF NOT EXISTS cvs_submitted_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interviews_scheduled_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS offers_made_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_forecast DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS fee_percentage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS exclusivity_expires_at DATE,
  ADD COLUMN IF NOT EXISTS job_source TEXT,
  ADD COLUMN IF NOT EXISTS closed_reason TEXT,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- 7. Create job_submissions table (CV submissions per job)
CREATE TABLE public.job_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  cv_submission_id UUID NOT NULL REFERENCES public.cv_submissions(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_response TEXT CHECK (client_response IN ('pending', 'interested', 'rejected', 'interview')),
  client_responded_at TIMESTAMPTZ,
  rejection_reason TEXT,
  rejection_category TEXT CHECK (rejection_category IN ('skills', 'experience', 'salary', 'location', 'culture', 'timing', 'other')),
  notes TEXT,
  UNIQUE(job_id, cv_submission_id)
);

-- 8. Create rejection_reasons lookup table
CREATE TABLE public.rejection_reasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  reason TEXT NOT NULL,
  is_candidate_rejection BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Enable Row Level Security on all new tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejection_reasons ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for clients table
CREATE POLICY "clients_select_policy" ON public.clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.view'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "clients_insert_policy" ON public.clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.create'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "clients_update_policy" ON public.clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.update'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "clients_delete_policy" ON public.clients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.delete'
    )
    OR public.is_full_admin(auth.uid())
  );

-- 11. Create RLS policies for client_contacts table
CREATE POLICY "client_contacts_select_policy" ON public.client_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.view'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "client_contacts_insert_policy" ON public.client_contacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.create'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "client_contacts_update_policy" ON public.client_contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.update'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "client_contacts_delete_policy" ON public.client_contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.delete'
    )
    OR public.is_full_admin(auth.uid())
  );

-- 12. Create RLS policies for client_terms table
CREATE POLICY "client_terms_select_policy" ON public.client_terms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.view'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "client_terms_insert_policy" ON public.client_terms FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.create'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "client_terms_update_policy" ON public.client_terms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.update'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "client_terms_delete_policy" ON public.client_terms FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.delete'
    )
    OR public.is_full_admin(auth.uid())
  );

-- 13. Create RLS policies for client_interactions table
CREATE POLICY "client_interactions_select_policy" ON public.client_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.view'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "client_interactions_insert_policy" ON public.client_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.create'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "client_interactions_update_policy" ON public.client_interactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.update'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "client_interactions_delete_policy" ON public.client_interactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'clients.delete'
    )
    OR public.is_full_admin(auth.uid())
  );

-- 14. Create RLS policies for job_submissions table
CREATE POLICY "job_submissions_select_policy" ON public.job_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'jobs.view'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "job_submissions_insert_policy" ON public.job_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'jobs.create'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "job_submissions_update_policy" ON public.job_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'jobs.update'
    )
    OR public.is_full_admin(auth.uid())
  );

CREATE POLICY "job_submissions_delete_policy" ON public.job_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_permissions
      WHERE staff_permissions.user_id = auth.uid()
      AND staff_permissions.permission = 'jobs.delete'
    )
    OR public.is_full_admin(auth.uid())
  );

-- 15. Create RLS policies for rejection_reasons (public read)
CREATE POLICY "rejection_reasons_select_policy" ON public.rejection_reasons FOR SELECT
  USING (true);

CREATE POLICY "rejection_reasons_admin_policy" ON public.rejection_reasons 
  FOR ALL USING (public.is_full_admin(auth.uid()));

-- 16. Create indexes for performance
CREATE INDEX idx_clients_company_name ON public.clients(company_name);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_psl_status ON public.clients(psl_status);
CREATE INDEX idx_clients_account_manager ON public.clients(account_manager_id);
CREATE INDEX idx_client_contacts_client_id ON public.client_contacts(client_id);
CREATE INDEX idx_client_contacts_email ON public.client_contacts(email);
CREATE INDEX idx_client_terms_client_id ON public.client_terms(client_id);
CREATE INDEX idx_client_terms_active ON public.client_terms(is_active) WHERE is_active = true;
CREATE INDEX idx_client_interactions_client_id ON public.client_interactions(client_id);
CREATE INDEX idx_client_interactions_created_at ON public.client_interactions(created_at);
CREATE INDEX idx_jobs_client_id ON public.jobs(client_id);
CREATE INDEX idx_jobs_priority ON public.jobs(priority);
CREATE INDEX idx_jobs_job_type ON public.jobs(job_type_category);
CREATE INDEX idx_job_submissions_job_id ON public.job_submissions(job_id);
CREATE INDEX idx_job_submissions_cv_id ON public.job_submissions(cv_submission_id);
CREATE INDEX idx_job_submissions_response ON public.job_submissions(client_response);

-- 17. Create triggers for updated_at on new tables
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_contacts_updated_at
  BEFORE UPDATE ON public.client_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 18. Create function to update client placement stats
CREATE OR REPLACE FUNCTION public.update_client_placement_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE public.clients c
    SET 
      total_placements = total_placements + 1,
      lifetime_revenue = lifetime_revenue + COALESCE(NEW.fee_value, 0),
      last_placement_at = NEW.actual_start_date
    FROM public.candidate_pipeline cp
    JOIN public.jobs j ON j.id = cp.job_id
    WHERE cp.id = NEW.pipeline_id
    AND c.id = j.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 19. Create trigger for placement stats
CREATE TRIGGER update_client_stats_on_placement
  AFTER INSERT OR UPDATE ON public.placements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_placement_stats();

-- 20. Create function to update job submission counts
CREATE OR REPLACE FUNCTION public.update_job_submission_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs
    SET cvs_submitted_count = cvs_submitted_count + 1
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs
    SET cvs_submitted_count = GREATEST(0, cvs_submitted_count - 1)
    WHERE id = OLD.job_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 21. Create trigger for job submission counts
CREATE TRIGGER update_job_cv_count
  AFTER INSERT OR DELETE ON public.job_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_submission_counts();