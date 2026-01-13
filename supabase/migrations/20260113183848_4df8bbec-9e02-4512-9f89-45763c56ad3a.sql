-- Add source tracking and deduplication to job_status_updates
ALTER TABLE public.job_status_updates 
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS email_message_id TEXT;

-- Create unique index for deduplication (only for non-null message IDs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_status_updates_message_id 
  ON public.job_status_updates(email_message_id) 
  WHERE email_message_id IS NOT NULL;

-- Create email ingestion audit log table
CREATE TABLE IF NOT EXISTS public.email_ingestion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Email metadata
  message_id TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Processing status
  status TEXT NOT NULL DEFAULT 'received',
  error_message TEXT,
  
  -- Linked update (if created)
  job_status_update_id UUID REFERENCES public.job_status_updates(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  processed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.email_ingestion_log ENABLE ROW LEVEL SECURITY;

-- Staff with jobs.view can see email logs
CREATE POLICY "Staff with jobs.view can see email logs"
  ON public.email_ingestion_log FOR SELECT
  TO authenticated
  USING (public.has_permission(auth.uid(), 'jobs.view') OR public.is_full_admin(auth.uid()));

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_ingestion_log_status 
  ON public.email_ingestion_log(status);

CREATE INDEX IF NOT EXISTS idx_email_ingestion_log_created_at 
  ON public.email_ingestion_log(created_at DESC);