-- Create storage bucket for CV uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-uploads', 'cv-uploads', false);

-- Create storage policies for CV uploads
CREATE POLICY "Anyone can upload CVs for job applications" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cv-uploads');

CREATE POLICY "Admins can view all CV files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cv-uploads' AND (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE admin_profiles.user_id = auth.uid()
  )
));

-- Add cv_file_url column to job_applications table if it doesn't exist
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS cv_file_url text;