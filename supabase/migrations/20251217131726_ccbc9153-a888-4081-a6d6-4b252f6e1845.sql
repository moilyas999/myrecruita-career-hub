-- Create function to get user's admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.admin_profiles 
  WHERE admin_profiles.user_id = get_admin_role.user_id
  LIMIT 1;
$$;

-- Create function to check if user has full admin access
CREATE OR REPLACE FUNCTION public.is_full_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE admin_profiles.user_id = is_full_admin.user_id
    AND admin_profiles.role = 'admin'
  );
$$;

-- Update CV submissions RLS policies
DROP POLICY IF EXISTS "Admins can view CV submissions" ON cv_submissions;

-- Full admins can see everything
CREATE POLICY "Full admins can view all CV submissions" 
ON cv_submissions FOR SELECT 
USING (is_full_admin(auth.uid()));

-- CV uploaders can only see their own CVs from last 3 days
CREATE POLICY "CV uploaders can view own recent CVs" 
ON cv_submissions FOR SELECT 
USING (
  get_admin_role(auth.uid()) = 'cv_uploader'
  AND added_by = auth.uid()
  AND created_at > NOW() - INTERVAL '3 days'
);

-- Update job_applications RLS - only full admins
DROP POLICY IF EXISTS "Admins can view job applications" ON job_applications;
CREATE POLICY "Full admins can view job applications" 
ON job_applications FOR SELECT 
USING (is_full_admin(auth.uid()));

-- Update career_partner_requests RLS - only full admins
DROP POLICY IF EXISTS "Admins can view career partner requests" ON career_partner_requests;
CREATE POLICY "Full admins can view career partner requests" 
ON career_partner_requests FOR SELECT 
USING (is_full_admin(auth.uid()));

-- Update talent_requests RLS - only full admins
DROP POLICY IF EXISTS "Admins can view talent requests" ON talent_requests;
CREATE POLICY "Full admins can view talent requests" 
ON talent_requests FOR SELECT 
USING (is_full_admin(auth.uid()));

-- Update employer_job_submissions RLS - only full admins
DROP POLICY IF EXISTS "admin_view_employer" ON employer_job_submissions;
CREATE POLICY "Full admins can view employer submissions" 
ON employer_job_submissions FOR SELECT 
USING (is_full_admin(auth.uid()));

-- Update contact_submissions RLS - only full admins
DROP POLICY IF EXISTS "admin_view_contact" ON contact_submissions;
CREATE POLICY "Full admins can view contact submissions" 
ON contact_submissions FOR SELECT 
USING (is_full_admin(auth.uid()));

-- Update admin_profiles RLS - only full admins can view
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON admin_profiles;
CREATE POLICY "Full admins can view all admin profiles" 
ON admin_profiles FOR SELECT 
USING (is_full_admin(auth.uid()));