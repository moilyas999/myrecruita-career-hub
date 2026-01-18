-- Phase 4: Automation System Tables

-- Create automation_rules table for defining automated workflows
CREATE TABLE public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN (
    'cv_submitted', 'cv_score_above', 'stage_changed', 'job_created', 
    'job_ageing', 'interview_scheduled', 'placement_made', 
    'client_interaction', 'time_based', 'inactivity'
  )),
  trigger_config jsonb NOT NULL DEFAULT '{}',
  action_type text NOT NULL CHECK (action_type IN (
    'create_task', 'send_notification', 'move_stage', 
    'assign_user', 'update_status', 'add_tag'
  )),
  action_config jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_triggered_at timestamptz,
  trigger_count integer DEFAULT 0
);

-- Create automation_tasks table for task management
CREATE TABLE public.automation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.automation_rules(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  task_type text NOT NULL DEFAULT 'custom' CHECK (task_type IN (
    'follow_up', 'review_cv', 'schedule_interview', 'send_feedback',
    'client_check_in', 'job_review', 'custom'
  )),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date timestamptz,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  related_cv_id uuid REFERENCES public.cv_submissions(id) ON DELETE SET NULL,
  related_job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  related_pipeline_id uuid REFERENCES public.candidate_pipeline(id) ON DELETE SET NULL,
  related_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_rules
CREATE POLICY "Staff can view automation rules" 
  ON public.automation_rules 
  FOR SELECT 
  TO authenticated
  USING (public.has_permission(auth.uid(), 'automation.view'::public.permission_type));

CREATE POLICY "Staff can create automation rules" 
  ON public.automation_rules 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'automation.manage'::public.permission_type));

CREATE POLICY "Staff can update automation rules" 
  ON public.automation_rules 
  FOR UPDATE 
  TO authenticated
  USING (public.has_permission(auth.uid(), 'automation.manage'::public.permission_type));

CREATE POLICY "Staff can delete automation rules" 
  ON public.automation_rules 
  FOR DELETE 
  TO authenticated
  USING (public.has_permission(auth.uid(), 'automation.manage'::public.permission_type));

-- RLS Policies for automation_tasks
CREATE POLICY "Users can view assigned tasks or all with permission" 
  ON public.automation_tasks 
  FOR SELECT 
  TO authenticated
  USING (
    assigned_to = auth.uid() 
    OR public.has_permission(auth.uid(), 'automation.view'::public.permission_type)
  );

CREATE POLICY "Users can update own tasks or all with permission" 
  ON public.automation_tasks 
  FOR UPDATE 
  TO authenticated
  USING (
    assigned_to = auth.uid() 
    OR public.has_permission(auth.uid(), 'automation.manage'::public.permission_type)
  );

CREATE POLICY "Staff can create tasks" 
  ON public.automation_tasks 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'automation.manage'::public.permission_type));

CREATE POLICY "Staff can delete tasks" 
  ON public.automation_tasks 
  FOR DELETE 
  TO authenticated
  USING (public.has_permission(auth.uid(), 'automation.manage'::public.permission_type));

-- Create indexes for performance
CREATE INDEX idx_automation_rules_active ON public.automation_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_automation_rules_trigger ON public.automation_rules(trigger_type);
CREATE INDEX idx_automation_tasks_assigned ON public.automation_tasks(assigned_to, status);
CREATE INDEX idx_automation_tasks_due_date ON public.automation_tasks(due_date) WHERE status = 'pending';
CREATE INDEX idx_automation_tasks_status ON public.automation_tasks(status);
CREATE INDEX idx_automation_tasks_related_job ON public.automation_tasks(related_job_id) WHERE related_job_id IS NOT NULL;
CREATE INDEX idx_automation_tasks_related_cv ON public.automation_tasks(related_cv_id) WHERE related_cv_id IS NOT NULL;

-- Create triggers for updated_at
CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_tasks_updated_at
  BEFORE UPDATE ON public.automation_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();