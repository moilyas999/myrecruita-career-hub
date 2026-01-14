-- Migration 2: Create candidate_pipeline and pipeline_activity tables

-- Create candidate_pipeline table
CREATE TABLE IF NOT EXISTS public.candidate_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_submission_id UUID NOT NULL REFERENCES public.cv_submissions(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'sourced' CHECK (stage IN ('sourced', 'screening', 'shortlisted', 'interviewing', 'offered', 'placed', 'rejected', 'withdrawn')),
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  rejection_reason TEXT,
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cv_submission_id, job_id)
);

-- Create pipeline_activity table for audit trail
CREATE TABLE IF NOT EXISTS public.pipeline_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.candidate_pipeline(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'stage_change', 'note_added', 'assigned', 'priority_changed', 'rejected', 'withdrawn')),
  from_stage TEXT,
  to_stage TEXT,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_job_id ON public.candidate_pipeline(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_cv_submission_id ON public.candidate_pipeline(cv_submission_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_stage ON public.candidate_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_assigned_to ON public.candidate_pipeline(assigned_to);
CREATE INDEX IF NOT EXISTS idx_pipeline_activity_pipeline_id ON public.pipeline_activity(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_activity_created_at ON public.pipeline_activity(created_at DESC);

-- Enable RLS
ALTER TABLE public.candidate_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidate_pipeline
CREATE POLICY "Staff with pipeline.view can view pipeline"
  ON public.candidate_pipeline
  FOR SELECT
  USING (
    is_full_admin(auth.uid()) OR 
    has_permission(auth.uid(), 'pipeline.view'::permission_type)
  );

CREATE POLICY "Staff with pipeline.create can insert pipeline entries"
  ON public.candidate_pipeline
  FOR INSERT
  WITH CHECK (
    is_full_admin(auth.uid()) OR 
    has_permission(auth.uid(), 'pipeline.create'::permission_type)
  );

CREATE POLICY "Staff with pipeline.update can update pipeline entries"
  ON public.candidate_pipeline
  FOR UPDATE
  USING (
    is_full_admin(auth.uid()) OR 
    has_permission(auth.uid(), 'pipeline.update'::permission_type)
  );

CREATE POLICY "Staff with pipeline.delete can delete pipeline entries"
  ON public.candidate_pipeline
  FOR DELETE
  USING (
    is_full_admin(auth.uid()) OR 
    has_permission(auth.uid(), 'pipeline.delete'::permission_type)
  );

-- RLS Policies for pipeline_activity
CREATE POLICY "Staff with pipeline.view can view activity"
  ON public.pipeline_activity
  FOR SELECT
  USING (
    is_full_admin(auth.uid()) OR 
    has_permission(auth.uid(), 'pipeline.view'::permission_type)
  );

CREATE POLICY "Staff with pipeline.update can insert activity"
  ON public.pipeline_activity
  FOR INSERT
  WITH CHECK (
    is_full_admin(auth.uid()) OR 
    has_permission(auth.uid(), 'pipeline.update'::permission_type) OR
    has_permission(auth.uid(), 'pipeline.create'::permission_type)
  );

-- Trigger for updated_at
CREATE TRIGGER update_candidate_pipeline_updated_at
  BEFORE UPDATE ON public.candidate_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update assign_role_permissions function to include pipeline permissions
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
      'pipeline.view', 'pipeline.create', 'pipeline.update', 'pipeline.delete'
    ]::public.permission_type[]);
  
  ELSIF _role = 'recruiter' THEN
    INSERT INTO public.staff_permissions (user_id, permission)
    SELECT _user_id, unnest(ARRAY[
      'cv.view', 'cv.create', 'cv.update', 'cv.delete', 'cv.export',
      'jobs.view', 'jobs.create', 'jobs.update', 'jobs.delete',
      'applications.view', 'applications.manage',
      'talent.view', 'talent.create', 'talent.update', 'talent.delete',
      'analytics.view',
      'pipeline.view', 'pipeline.create', 'pipeline.update'
    ]::public.permission_type[]);
  
  ELSIF _role = 'account_manager' THEN
    INSERT INTO public.staff_permissions (user_id, permission)
    SELECT _user_id, unnest(ARRAY[
      'jobs.view',
      'applications.view',
      'talent.view',
      'submissions.view',
      'analytics.view',
      'pipeline.view'
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