-- Drop the existing restrictive INSERT policies
DROP POLICY IF EXISTS "Anyone can submit CVs" ON cv_submissions;
DROP POLICY IF EXISTS "Admins can insert CVs" ON cv_submissions;

-- Recreate as permissive policies
CREATE POLICY "Anyone can submit CVs"
ON cv_submissions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can insert CVs"
ON cv_submissions
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Add UPDATE policy so users can update their own CV submissions
CREATE POLICY "Users can update their own CV submissions"
ON cv_submissions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix the existing record for this user
UPDATE cv_submissions 
SET cv_file_url = 'https://yoegksjmdtubnkgdtttj.supabase.co/storage/v1/object/public/cv-uploads/user-cvs/48b2fa59-890c-4a0c-a0cb-b90b3a6a57a5-cv-1765898724645.pdf',
    source = 'profile'
WHERE user_id = '48b2fa59-890c-4a0c-a0cb-b90b3a6a57a5';