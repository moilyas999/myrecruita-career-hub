-- Add email classification fields to ingestion log for relevance filtering
ALTER TABLE public.email_ingestion_log
  ADD COLUMN IF NOT EXISTS email_type TEXT,
  ADD COLUMN IF NOT EXISTS is_relevant BOOLEAN,
  ADD COLUMN IF NOT EXISTS filter_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.email_ingestion_log.email_type IS 'Classification: job_status_update, general_inquiry, spam, out_of_office, marketing, unrelated';
COMMENT ON COLUMN public.email_ingestion_log.is_relevant IS 'Whether AI determined this email is about job status changes';
COMMENT ON COLUMN public.email_ingestion_log.filter_reason IS 'AI reasoning for filtering decision';