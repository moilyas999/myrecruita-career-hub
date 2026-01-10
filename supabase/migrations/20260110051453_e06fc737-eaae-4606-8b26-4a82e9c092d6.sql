-- =============================================
-- STAFF ROLES, PERMISSIONS & NOTIFICATIONS SYSTEM
-- =============================================

-- 1. Create staff_role enum for all recruitment agency roles
CREATE TYPE public.staff_role AS ENUM (
  'admin',           -- Full access to everything
  'recruiter',       -- CV, jobs, applications, talent profiles
  'account_manager', -- Employer submissions, talent requests, contacts
  'marketing',       -- Blog posts, analytics
  'cv_uploader',     -- Limited: own CVs from last 3 days
  'viewer'           -- Read-only access to CVs and jobs
);

-- 2. Create permission_type enum for granular permissions
CREATE TYPE public.permission_type AS ENUM (
  -- CV Management
  'cv.view', 'cv.create', 'cv.update', 'cv.delete', 'cv.export',
  -- Job Management
  'jobs.view', 'jobs.create', 'jobs.update', 'jobs.delete',
  -- Applications
  'applications.view', 'applications.manage',
  -- Talent Profiles
  'talent.view', 'talent.create', 'talent.update', 'talent.delete',
  -- Submissions (contact, employer, career partner, talent requests)
  'submissions.view', 'submissions.delete',
  -- Blog
  'blog.view', 'blog.create', 'blog.update', 'blog.delete',
  -- Analytics
  'analytics.view',
  -- Staff Management
  'staff.view', 'staff.create', 'staff.update', 'staff.delete',
  -- Settings
  'settings.view', 'settings.update',
  -- Notifications
  'notifications.manage'
);

-- 3. Create staff_permissions table for individual permission overrides
CREATE TABLE public.staff_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission public.permission_type NOT NULL,
  granted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, permission)
);

-- 4. Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  -- Channel preferences
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  -- Event preferences (JSONB for flexibility)
  event_preferences JSONB NOT NULL DEFAULT '{
    "cv_submission": true,
    "job_application": true,
    "contact_submission": true,
    "career_partner_request": true,
    "employer_job_submission": true,
    "talent_request": true,
    "staff_added": true,
    "permission_changed": true,
    "blog_published": true,
    "system_updates": true,
    "weekly_digest": false
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  category TEXT NOT NULL, -- matches event types like 'cv_submission', 'job_application', etc.
  link TEXT, -- optional deep link for navigation
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Add display_name and avatar_url to admin_profiles
ALTER TABLE public.admin_profiles 
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 7. Enable Row Level Security on new tables
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 8. Create security definer function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission public.permission_type)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_permissions
    WHERE user_id = _user_id
      AND permission = _permission
  )
$$;

-- 9. Create function to get all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS SETOF public.permission_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT permission
  FROM public.staff_permissions
  WHERE user_id = _user_id
$$;

-- 10. Create function to assign default permissions based on role
CREATE OR REPLACE FUNCTION public.assign_role_permissions(_user_id UUID, _role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete existing permissions
  DELETE FROM public.staff_permissions WHERE user_id = _user_id;
  
  -- Assign permissions based on role
  IF _role = 'admin' THEN
    INSERT INTO public.staff_permissions (user_id, permission)
    SELECT _user_id, unnest(ARRAY[
      'cv.view', 'cv.create', 'cv.update', 'cv.delete', 'cv.export',
      'jobs.view', 'jobs.create', 'jobs.update', 'jobs.delete',
      'applications.view', 'applications.manage',
      'talent.view', 'talent.create', 'talent.update', 'talent.delete',
      'submissions.view', 'submissions.delete',
      'blog.view', 'blog.create', 'blog.update', 'blog.delete',
      'analytics.view',
      'staff.view', 'staff.create', 'staff.update', 'staff.delete',
      'settings.view', 'settings.update',
      'notifications.manage'
    ]::public.permission_type[]);
  
  ELSIF _role = 'recruiter' THEN
    INSERT INTO public.staff_permissions (user_id, permission)
    SELECT _user_id, unnest(ARRAY[
      'cv.view', 'cv.create', 'cv.update', 'cv.delete', 'cv.export',
      'jobs.view', 'jobs.create', 'jobs.update', 'jobs.delete',
      'applications.view', 'applications.manage',
      'talent.view', 'talent.create', 'talent.update', 'talent.delete',
      'analytics.view'
    ]::public.permission_type[]);
  
  ELSIF _role = 'account_manager' THEN
    INSERT INTO public.staff_permissions (user_id, permission)
    SELECT _user_id, unnest(ARRAY[
      'jobs.view',
      'applications.view',
      'talent.view',
      'submissions.view',
      'analytics.view'
    ]::public.permission_type[]);
  
  ELSIF _role = 'marketing' THEN
    INSERT INTO public.staff_permissions (user_id, permission)
    SELECT _user_id, unnest(ARRAY[
      'jobs.view',
      'talent.view',
      'blog.view', 'blog.create', 'blog.update', 'blog.delete',
      'analytics.view'
    ]::public.permission_type[]);
  
  ELSIF _role = 'cv_uploader' THEN
    INSERT INTO public.staff_permissions (user_id, permission)
    SELECT _user_id, unnest(ARRAY[
      'cv.create'
    ]::public.permission_type[]);
  
  ELSIF _role = 'viewer' THEN
    INSERT INTO public.staff_permissions (user_id, permission)
    SELECT _user_id, unnest(ARRAY[
      'cv.view',
      'jobs.view',
      'talent.view'
    ]::public.permission_type[]);
  END IF;
  
  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- 11. RLS Policies for staff_permissions
CREATE POLICY "Full admins can manage all permissions"
  ON public.staff_permissions FOR ALL
  USING (is_full_admin(auth.uid()));

CREATE POLICY "Users can view own permissions"
  ON public.staff_permissions FOR SELECT
  USING (user_id = auth.uid());

-- 12. RLS Policies for notification_preferences
CREATE POLICY "Full admins can manage all notification preferences"
  ON public.notification_preferences FOR ALL
  USING (is_full_admin(auth.uid()));

CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 13. RLS Policies for notifications
CREATE POLICY "Full admins can manage all notifications"
  ON public.notifications FOR ALL
  USING (is_full_admin(auth.uid()));

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- 14. Create trigger for notification_preferences updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Create indexes for performance
CREATE INDEX idx_staff_permissions_user_id ON public.staff_permissions(user_id);
CREATE INDEX idx_staff_permissions_permission ON public.staff_permissions(permission);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- 16. Assign permissions to existing admin users
DO $$
DECLARE
  admin_record RECORD;
BEGIN
  FOR admin_record IN SELECT user_id, role FROM public.admin_profiles
  LOOP
    PERFORM public.assign_role_permissions(admin_record.user_id, admin_record.role);
  END LOOP;
END;
$$;