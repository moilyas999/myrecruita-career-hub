-- Fix RLS insert policies for public form submissions

-- Drop existing INSERT policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow anyone to submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow anyone to submit employer job form" ON public.employer_job_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit employer job posts" ON public.employer_job_submissions;

-- Create insert policies for public users to submit forms
CREATE POLICY "Allow anyone to submit contact form"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anyone to submit employer job form"
ON public.employer_job_submissions
FOR INSERT
WITH CHECK (true);