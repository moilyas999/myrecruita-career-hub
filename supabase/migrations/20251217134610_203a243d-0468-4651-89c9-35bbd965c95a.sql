-- Add DELETE policy for full admins on cv_submissions
CREATE POLICY "Full admins can delete CV submissions"
ON public.cv_submissions
FOR DELETE
USING (is_full_admin(auth.uid()));