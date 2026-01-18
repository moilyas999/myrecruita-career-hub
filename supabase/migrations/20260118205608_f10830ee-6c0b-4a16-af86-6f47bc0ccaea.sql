-- Phase 7: Automation Execution Engine
-- Create automation_executions table to track rule executions

CREATE TABLE public.automation_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.automation_rules(id) ON DELETE SET NULL,
  rule_name text NOT NULL,
  trigger_event text NOT NULL,
  trigger_context jsonb DEFAULT '{}'::jsonb,
  actions_executed jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'partial')),
  error_message text,
  execution_time_ms integer,
  executed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

-- Create index for efficient querying
CREATE INDEX idx_automation_executions_rule_id ON public.automation_executions(rule_id);
CREATE INDEX idx_automation_executions_created_at ON public.automation_executions(created_at DESC);
CREATE INDEX idx_automation_executions_status ON public.automation_executions(status);

-- RLS Policy: Staff with automation.view can see executions
CREATE POLICY "Staff can view automation executions"
  ON public.automation_executions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- RLS Policy: Service role can insert executions (from edge functions)
CREATE POLICY "Service role can insert executions"
  ON public.automation_executions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON TABLE public.automation_executions IS 'Tracks all automation rule executions with context and results';