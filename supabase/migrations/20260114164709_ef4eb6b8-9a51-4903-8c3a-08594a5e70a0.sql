-- Phase 2: Enhance bulk import schema for robustness
-- Add retry tracking, error categorization, heartbeat, and duplicate detection

-- Add new columns to bulk_import_files for retry tracking and error categorization
ALTER TABLE public.bulk_import_files 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_category TEXT,
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS file_size_bytes INTEGER;

-- Add heartbeat and processing tracking to bulk_import_sessions
ALTER TABLE public.bulk_import_sessions 
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_file_id UUID,
ADD COLUMN IF NOT EXISTS batch_size INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS avg_parse_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS total_retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_breakdown JSONB DEFAULT '{}'::jsonb;

-- Create index for faster stale session detection
CREATE INDEX IF NOT EXISTS idx_bulk_import_sessions_heartbeat 
ON public.bulk_import_sessions(last_heartbeat) 
WHERE status = 'processing';

-- Create index for faster pending file queries
CREATE INDEX IF NOT EXISTS idx_bulk_import_files_status_session 
ON public.bulk_import_files(session_id, status);

-- Create index for duplicate detection during import
CREATE INDEX IF NOT EXISTS idx_cv_submissions_email_lower 
ON public.cv_submissions(lower(email));

-- Add comment for documentation
COMMENT ON COLUMN public.bulk_import_files.retry_count IS 'Number of times this file has been retried';
COMMENT ON COLUMN public.bulk_import_files.error_category IS 'Categorized error type: RATE_LIMIT, PAYMENT_REQUIRED, FILE_ERROR, AI_ERROR, PARSE_ERROR, DB_ERROR';
COMMENT ON COLUMN public.bulk_import_sessions.last_heartbeat IS 'Last time the processing function updated this session, used for stale detection';
COMMENT ON COLUMN public.bulk_import_sessions.error_breakdown IS 'JSON object with counts per error category';