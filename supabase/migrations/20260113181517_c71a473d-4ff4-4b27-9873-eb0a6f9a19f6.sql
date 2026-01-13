-- Create job_status_updates table for AI-processed email review queue
CREATE TABLE public.job_status_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Source email details
  email_from TEXT,
  email_subject TEXT,
  email_body TEXT NOT NULL,
  
  -- AI-detected match
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_reference TEXT,
  job_title TEXT,
  
  -- AI analysis
  suggested_status TEXT NOT NULL DEFAULT 'expired',
  confidence_score INTEGER NOT NULL DEFAULT 0,
  ai_reasoning TEXT,
  
  -- Review workflow
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Audit
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_job_status_updates_status ON job_status_updates(status);
CREATE INDEX idx_job_status_updates_job_id ON job_status_updates(job_id);
CREATE INDEX idx_job_status_updates_created_at ON job_status_updates(created_at DESC);

-- Enable RLS
ALTER TABLE job_status_updates ENABLE ROW LEVEL SECURITY;

-- Staff with jobs.view permission can see all updates
CREATE POLICY "Staff can view job status updates"
  ON job_status_updates FOR SELECT
  TO authenticated
  USING (public.has_permission(auth.uid(), 'jobs.view'));

-- Staff with jobs.update permission can create updates
CREATE POLICY "Staff can create job status updates"
  ON job_status_updates FOR INSERT
  TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'jobs.update'));

-- Staff with jobs.update permission can update
CREATE POLICY "Staff can update job status updates"
  ON job_status_updates FOR UPDATE
  TO authenticated
  USING (public.has_permission(auth.uid(), 'jobs.update'));

-- Trigger for updated_at
CREATE TRIGGER update_job_status_updates_updated_at
  BEFORE UPDATE ON job_status_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();