-- Create employer_job_submissions table
CREATE TABLE public.employer_job_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  sector TEXT NOT NULL,
  location TEXT NOT NULL,
  job_spec_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employer_job_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can submit employer job posts" 
ON public.employer_job_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view employer job submissions" 
ON public.employer_job_submissions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can submit contact forms" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions" 
ON public.contact_submissions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create storage policies for employer uploads
CREATE POLICY "Public can upload employer job specs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cv-uploads' AND (storage.foldername(name))[1] = 'employer-uploads');