-- Update the assign_role_permissions function to include matching permissions
CREATE OR REPLACE FUNCTION public.assign_role_permissions(_user_id uuid, _role text)
RETURNS void
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
      'notifications.manage',
      'pipeline.view', 'pipeline.create', 'pipeline.update', 'pipeline.delete',
      'matching.view', 'matching.create', 'matching.history'
    ]::public.permission_type[]);
  
  ELSIF _role = 'recruiter' THEN
    INSERT INTO public.staff_permissions (user_id, permission)
    SELECT _user_id, unnest(ARRAY[
      'cv.view', 'cv.create', 'cv.update', 'cv.delete', 'cv.export',
      'jobs.view', 'jobs.create', 'jobs.update', 'jobs.delete',
      'applications.view', 'applications.manage',
      'talent.view', 'talent.create', 'talent.update', 'talent.delete',
      'analytics.view',
      'pipeline.view', 'pipeline.create', 'pipeline.update',
      'matching.view', 'matching.create', 'matching.history'
    ]::public.permission_type[]);
  
  ELSIF _role = 'account_manager' THEN
    INSERT INTO public.staff_permissions (user_id, permission)
    SELECT _user_id, unnest(ARRAY[
      'jobs.view',
      'applications.view',
      'talent.view',
      'submissions.view',
      'analytics.view',
      'pipeline.view',
      'matching.history'
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
      'talent.view',
      'pipeline.view'
    ]::public.permission_type[]);
  END IF;
  
  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Update RLS policies for cv_match_history to use granular permissions
DROP POLICY IF EXISTS "Admins can view all match history" ON cv_match_history;
DROP POLICY IF EXISTS "Admins can insert match history" ON cv_match_history;

-- Create new granular policies for cv_match_history
CREATE POLICY "Users with matching.history permission can view"
  ON cv_match_history FOR SELECT
  TO authenticated
  USING (
    public.is_full_admin(auth.uid()) 
    OR public.has_permission(auth.uid(), 'matching.history'::permission_type)
    OR matched_by = auth.uid()
  );

CREATE POLICY "Users with matching.create permission can insert"
  ON cv_match_history FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.is_full_admin(auth.uid()) OR public.has_permission(auth.uid(), 'matching.create'::permission_type))
    AND matched_by = auth.uid()
  );

-- Update RLS policies for cv_match_results
DROP POLICY IF EXISTS "Admins can view all match results" ON cv_match_results;
DROP POLICY IF EXISTS "Admins can insert match results" ON cv_match_results;
DROP POLICY IF EXISTS "Admins can update match results" ON cv_match_results;

-- Create new granular policies for cv_match_results
CREATE POLICY "Users with matching.history permission can view results"
  ON cv_match_results FOR SELECT
  TO authenticated
  USING (
    public.is_full_admin(auth.uid()) 
    OR public.has_permission(auth.uid(), 'matching.history'::permission_type)
    OR EXISTS (
      SELECT 1 FROM cv_match_history 
      WHERE cv_match_history.id = cv_match_results.match_history_id 
      AND cv_match_history.matched_by = auth.uid()
    )
  );

CREATE POLICY "Users with matching.create permission can insert results"
  ON cv_match_results FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_full_admin(auth.uid()) 
    OR public.has_permission(auth.uid(), 'matching.create'::permission_type)
  );

CREATE POLICY "Users with matching permissions can update their results"
  ON cv_match_results FOR UPDATE
  TO authenticated
  USING (
    public.is_full_admin(auth.uid()) 
    OR (
      public.has_permission(auth.uid(), 'matching.create'::permission_type)
      AND EXISTS (
        SELECT 1 FROM cv_match_history 
        WHERE cv_match_history.id = cv_match_results.match_history_id 
        AND cv_match_history.matched_by = auth.uid()
      )
    )
  );