-- Add RLS policy for staff with cv.view permission to view CV submissions
-- This enables recruiters and other staff to search for candidates in the pipeline

CREATE POLICY "Staff with cv.view can view CV submissions"
  ON public.cv_submissions
  FOR SELECT
  TO authenticated
  USING (public.has_permission(auth.uid(), 'cv.view'::public.permission_type));