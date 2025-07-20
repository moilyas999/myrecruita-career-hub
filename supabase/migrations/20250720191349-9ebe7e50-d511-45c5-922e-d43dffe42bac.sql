-- Fix RLS policies for public form submissions

-- Ensure RLS is enabled (should already be enabled from previous migration)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_job_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anyone to submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow anyone to submit employer job form" ON public.employer_job_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit employer job posts" ON public.employer_job_submissions;

-- Create new insert policies for public users
CREATE POLICY "Allow anyone to submit contact form"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anyone to submit employer job form"
ON public.employer_job_submissions
FOR INSERT
WITH CHECK (true);

-- Verify admin can still view these submissions
CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view employer job submissions"
ON public.employer_job_submissions
FOR SELECT
USING (is_admin(auth.uid()));