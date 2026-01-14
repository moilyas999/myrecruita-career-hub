-- ============================================
-- Staff Accountability and Workflow Tracking
-- ============================================

-- 1. Add ownership/assignment fields to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS assigned_to UUID;

-- 2. Add processing tracking to cv_submissions
ALTER TABLE public.cv_submissions
ADD COLUMN IF NOT EXISTS processed_by UUID,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- 3. Add management assignment to talent_profiles
ALTER TABLE public.talent_profiles
ADD COLUMN IF NOT EXISTS managed_by UUID;

-- 4. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON public.jobs(assigned_to);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON public.jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_cv_submissions_processed_by ON public.cv_submissions(processed_by);
CREATE INDEX IF NOT EXISTS idx_cv_submissions_added_by ON public.cv_submissions(added_by);
CREATE INDEX IF NOT EXISTS idx_talent_managed_by ON public.talent_profiles(managed_by);

-- 5. Add composite index on admin_audit_log for user activity queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_activity 
ON public.admin_audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource 
ON public.admin_audit_log(resource_type, created_at DESC);

-- 6. Add index on cv_upload_activity_log for activity queries
CREATE INDEX IF NOT EXISTS idx_cv_upload_activity_user 
ON public.cv_upload_activity_log(user_id, created_at DESC);

-- 7. Add RLS policy for staff to view their own activity in admin_audit_log
CREATE POLICY "Staff can view own audit logs"
ON public.admin_audit_log
FOR SELECT
USING (user_id = auth.uid());

-- 8. Allow admins to update cv_submissions for processing assignment
DROP POLICY IF EXISTS "Admins can update CV submissions" ON public.cv_submissions;
CREATE POLICY "Admins can update CV submissions"
ON public.cv_submissions
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 9. Update the cv_upload_activity_log policies to allow staff to view own activity
CREATE POLICY "Staff can view own activity logs"
ON public.cv_upload_activity_log
FOR SELECT
USING (user_id = auth.uid());