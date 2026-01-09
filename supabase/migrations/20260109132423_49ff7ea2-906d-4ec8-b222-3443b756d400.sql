-- Create app_settings table for system configuration
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID
);

-- Insert default notification emails setting
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'notification_emails',
  '["zuhair@myrecruita.com"]',
  'Email addresses to receive admin notifications'
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read settings
CREATE POLICY "Admins can read settings"
  ON public.app_settings FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Full admins can update settings
CREATE POLICY "Full admins can update settings"
  ON public.app_settings FOR UPDATE
  USING (public.is_full_admin(auth.uid()))
  WITH CHECK (public.is_full_admin(auth.uid()));