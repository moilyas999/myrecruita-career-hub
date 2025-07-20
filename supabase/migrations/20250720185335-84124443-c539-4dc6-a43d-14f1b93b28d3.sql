-- Update storage policies to allow public CV uploads from submit-cv page
CREATE POLICY "Public can upload CVs for submissions" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cv-uploads' AND (storage.foldername(name))[1] = 'cv-submissions');