-- Temporarily disable RLS and recreate policies properly
ALTER TABLE public.contact_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_job_submissions DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anyone to submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow anyone to submit employer job form" ON public.employer_job_submissions;
DROP POLICY IF EXISTS "Admins can view employer job submissions" ON public.employer_job_submissions;

-- Re-enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_job_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies with explicit roles
CREATE POLICY "public_insert_contact" 
ON public.contact_submissions 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "admin_select_contact" 
ON public.contact_submissions 
FOR SELECT 
TO public
USING (is_admin(auth.uid()));

CREATE POLICY "public_insert_employer" 
ON public.employer_job_submissions 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "admin_select_employer" 
ON public.employer_job_submissions 
FOR SELECT 
TO public
USING (is_admin(auth.uid()));