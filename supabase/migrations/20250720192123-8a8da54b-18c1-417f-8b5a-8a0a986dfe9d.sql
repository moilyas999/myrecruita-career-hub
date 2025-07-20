-- Re-enable RLS with proper anonymous access
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_job_submissions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "public_insert_contact" ON public.contact_submissions;
DROP POLICY IF EXISTS "admin_select_contact" ON public.contact_submissions;
DROP POLICY IF EXISTS "public_insert_employer" ON public.employer_job_submissions;
DROP POLICY IF EXISTS "admin_select_employer" ON public.employer_job_submissions;

-- Create policies for anonymous users (not just authenticated public)
CREATE POLICY "anonymous_insert_contact" 
ON public.contact_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "admin_view_contact" 
ON public.contact_submissions 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "anonymous_insert_employer" 
ON public.employer_job_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "admin_view_employer" 
ON public.employer_job_submissions 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));