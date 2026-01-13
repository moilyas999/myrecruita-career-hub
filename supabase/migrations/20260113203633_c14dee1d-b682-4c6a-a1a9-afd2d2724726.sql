-- Create bulk import sessions table
CREATE TABLE public.bulk_import_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  total_files INTEGER NOT NULL DEFAULT 0,
  parsed_count INTEGER NOT NULL DEFAULT 0,
  imported_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create bulk import files table
CREATE TABLE public.bulk_import_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.bulk_import_sessions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, parsing, parsed, importing, imported, error
  error_message TEXT,
  parsed_data JSONB,
  cv_submission_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_bulk_import_sessions_user_id ON public.bulk_import_sessions(user_id);
CREATE INDEX idx_bulk_import_sessions_status ON public.bulk_import_sessions(status);
CREATE INDEX idx_bulk_import_files_session_id ON public.bulk_import_files(session_id);
CREATE INDEX idx_bulk_import_files_status ON public.bulk_import_files(status);

-- Enable RLS
ALTER TABLE public.bulk_import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_import_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for bulk_import_sessions
CREATE POLICY "Users can view own import sessions"
  ON public.bulk_import_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own import sessions"
  ON public.bulk_import_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_admin(auth.uid()));

CREATE POLICY "Service role can update sessions"
  ON public.bulk_import_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Full admins can view all import sessions"
  ON public.bulk_import_sessions
  FOR SELECT
  USING (is_full_admin(auth.uid()));

-- RLS policies for bulk_import_files
CREATE POLICY "Users can view own import files"
  ON public.bulk_import_files
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bulk_import_sessions s 
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own import files"
  ON public.bulk_import_files
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.bulk_import_sessions s 
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ) AND is_admin(auth.uid()));

CREATE POLICY "Service role can update files"
  ON public.bulk_import_files
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Full admins can view all import files"
  ON public.bulk_import_files
  FOR SELECT
  USING (is_full_admin(auth.uid()));