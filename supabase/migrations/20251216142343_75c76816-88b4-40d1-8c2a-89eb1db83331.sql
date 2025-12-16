-- Add new columns to cv_submissions for admin-added CVs
ALTER TABLE public.cv_submissions 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website',
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id);

-- Add index for filtering by source
CREATE INDEX IF NOT EXISTS idx_cv_submissions_source ON public.cv_submissions(source);

-- Update RLS policy to allow admins to insert CVs
CREATE POLICY "Admins can insert CVs"
ON public.cv_submissions
FOR INSERT
WITH CHECK (is_admin(auth.uid()));