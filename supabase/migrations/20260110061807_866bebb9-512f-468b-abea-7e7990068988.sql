-- Fix cv_submissions INSERT policy for guest users
DROP POLICY IF EXISTS "Anyone can submit CVs" ON cv_submissions;

CREATE POLICY "Public can submit CVs" 
ON cv_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Fix job_applications INSERT policy for guest users
DROP POLICY IF EXISTS "Anyone can submit job applications" ON job_applications;

CREATE POLICY "Public can submit job applications" 
ON job_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);