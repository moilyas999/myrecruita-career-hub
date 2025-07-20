-- Create admin profiles table for role-based access
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  sector TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  benefits TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CV submissions table
CREATE TABLE public.cv_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cv_file_url TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create career partner requests table
CREATE TABLE public.career_partner_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_type TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create talent profiles table
CREATE TABLE public.talent_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  sector TEXT NOT NULL,
  years_experience INTEGER NOT NULL,
  preferred_location TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create talent requests table
CREATE TABLE public.talent_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_id UUID REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_partner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_requests ENABLE ROW LEVEL SECURITY;

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE admin_profiles.user_id = is_admin.user_id
  );
$$;

-- Admin policies
CREATE POLICY "Admins can view all admin profiles" 
ON public.admin_profiles FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert admin profiles" 
ON public.admin_profiles FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone" 
ON public.jobs FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage jobs" 
ON public.jobs FOR ALL 
USING (public.is_admin(auth.uid()));

-- Submissions policies (admin only)
CREATE POLICY "Admins can view job applications" 
ON public.job_applications FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view CV submissions" 
ON public.cv_submissions FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view career partner requests" 
ON public.career_partner_requests FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view talent requests" 
ON public.talent_requests FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Public insert policies for form submissions
CREATE POLICY "Anyone can submit job applications" 
ON public.job_applications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can submit CVs" 
ON public.cv_submissions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can submit career partner requests" 
ON public.career_partner_requests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can submit talent requests" 
ON public.talent_requests FOR INSERT 
WITH CHECK (true);

-- Talent profiles policies
CREATE POLICY "Visible talent profiles are viewable by everyone" 
ON public.talent_profiles FOR SELECT 
USING (is_visible = true);

CREATE POLICY "Admins can manage talent profiles" 
ON public.talent_profiles FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create functions for auto-generating reference IDs
CREATE OR REPLACE FUNCTION public.generate_job_reference()
RETURNS TEXT
LANGUAGE PLPGSQL
AS $$
DECLARE
  next_num INTEGER;
  ref_id TEXT;
BEGIN
  -- Get the next number
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference_id FROM 'MR-2025-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.jobs
  WHERE reference_id ~ '^MR-2025-\d+$';
  
  -- Format with leading zeros
  ref_id := 'MR-2025-' || LPAD(next_num::TEXT, 3, '0');
  
  RETURN ref_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_talent_reference()
RETURNS TEXT
LANGUAGE PLPGSQL
AS $$
DECLARE
  next_num INTEGER;
  ref_id TEXT;
BEGIN
  -- Get the next number
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference_id FROM 'TAL-MR-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.talent_profiles
  WHERE reference_id ~ '^TAL-MR-\d+$';
  
  -- Format with leading zeros
  ref_id := 'TAL-MR-' || LPAD(next_num::TEXT, 3, '0');
  
  RETURN ref_id;
END;
$$;

-- Create triggers for auto-updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_talent_profiles_updated_at
  BEFORE UPDATE ON public.talent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.jobs (reference_id, title, location, sector, description, requirements, benefits) VALUES
('MR-2025-001', 'Senior Software Engineer', 'London, UK', 'Technology', 'We are looking for an experienced Senior Software Engineer to join our dynamic team...', 'Bachelor''s degree in Computer Science or related field. 5+ years of experience in software development...', 'Competitive salary, health insurance, flexible working hours'),
('MR-2025-002', 'Marketing Manager', 'Manchester, UK', 'Marketing', 'Join our marketing team as a Marketing Manager and help drive our brand forward...', '3+ years of marketing experience. Strong analytical and communication skills...', 'Performance bonuses, professional development, remote work options'),
('MR-2025-003', 'Financial Analyst', 'Birmingham, UK', 'Finance', 'We seek a detail-oriented Financial Analyst to support our finance team...', 'Degree in Finance, Economics, or Accounting. 2+ years of analytical experience...', 'Pension scheme, training programs, career progression');

INSERT INTO public.talent_profiles (reference_id, role, sector, years_experience, preferred_location) VALUES
('TAL-MR-001', 'Audit Manager', 'Finance', 8, 'London, UK'),
('TAL-MR-002', 'DevOps Engineer', 'Technology', 5, 'Remote'),
('TAL-MR-003', 'HR Director', 'Human Resources', 12, 'Manchester, UK');