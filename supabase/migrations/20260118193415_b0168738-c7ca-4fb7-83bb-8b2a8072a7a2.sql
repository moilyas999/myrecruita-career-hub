-- Phase 6: Calendar & Scheduling Tables

-- Calendar Events table for interviews, meetings, follow-ups
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES public.candidate_pipeline(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES public.cv_submissions(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  assigned_to UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('interview', 'meeting', 'followup', 'reminder', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  meeting_link TEXT,
  google_event_id TEXT,
  google_calendar_id TEXT,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed', 'not_synced')),
  reminder_sent BOOLEAN DEFAULT false,
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_1h_sent BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Calendar Connections for OAuth tokens (Google Calendar)
CREATE TABLE public.calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'google' CHECK (provider IN ('google', 'outlook', 'other')),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  calendar_id TEXT,
  calendar_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Availability Slots for scheduling
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  specific_date DATE,
  is_available BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'Europe/London',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT recurring_or_specific CHECK (
    (is_recurring = true AND day_of_week IS NOT NULL AND specific_date IS NULL) OR
    (is_recurring = false AND specific_date IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX idx_calendar_events_assigned_to ON public.calendar_events(assigned_to);
CREATE INDEX idx_calendar_events_pipeline_id ON public.calendar_events(pipeline_id);
CREATE INDEX idx_calendar_events_job_id ON public.calendar_events(job_id);
CREATE INDEX idx_calendar_events_candidate_id ON public.calendar_events(candidate_id);
CREATE INDEX idx_calendar_events_event_type ON public.calendar_events(event_type);
CREATE INDEX idx_calendar_events_sync_status ON public.calendar_events(sync_status);
CREATE INDEX idx_availability_slots_user_id ON public.availability_slots(user_id);
CREATE INDEX idx_availability_slots_day_of_week ON public.availability_slots(day_of_week);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_events
-- Staff can view events they created or are assigned to
CREATE POLICY "Staff can view own and assigned events"
  ON public.calendar_events FOR SELECT
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    public.is_admin(auth.uid())
  );

-- Staff can create events
CREATE POLICY "Staff can create events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid()) AND
    auth.uid() = created_by
  );

-- Staff can update own events or assigned events
CREATE POLICY "Staff can update own or assigned events"
  ON public.calendar_events FOR UPDATE
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    public.is_full_admin(auth.uid())
  );

-- Only creator or full admin can delete
CREATE POLICY "Creator or admin can delete events"
  ON public.calendar_events FOR DELETE
  USING (
    auth.uid() = created_by OR 
    public.is_full_admin(auth.uid())
  );

-- RLS Policies for calendar_connections
-- Users can only see their own connections
CREATE POLICY "Users can view own calendar connections"
  ON public.calendar_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calendar connections"
  ON public.calendar_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar connections"
  ON public.calendar_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar connections"
  ON public.calendar_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for availability_slots
-- Users can view all availability for scheduling
CREATE POLICY "Staff can view all availability"
  ON public.availability_slots FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage own availability"
  ON public.availability_slots FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_admin(auth.uid()));

CREATE POLICY "Users can update own availability"
  ON public.availability_slots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own availability"
  ON public.availability_slots FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_connections_updated_at
  BEFORE UPDATE ON public.calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON public.availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();