-- Create activity log table for tracking cv_uploader actions
CREATE TABLE public.cv_upload_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cv_upload_activity_log ENABLE ROW LEVEL SECURITY;

-- Only full admins can view activity logs
CREATE POLICY "Full admins can view activity logs"
ON public.cv_upload_activity_log
FOR SELECT
USING (is_full_admin(auth.uid()));

-- Any admin can insert activity logs (cv_uploaders log their own actions)
CREATE POLICY "Admins can insert activity logs"
ON public.cv_upload_activity_log
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_cv_upload_activity_log_created_at ON public.cv_upload_activity_log(created_at DESC);
CREATE INDEX idx_cv_upload_activity_log_user_id ON public.cv_upload_activity_log(user_id);