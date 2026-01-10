-- Function to sync notification event types for all users
-- This ensures any new event types are added to existing user preferences
CREATE OR REPLACE FUNCTION public.sync_notification_event_types()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  all_event_types text[] := ARRAY[
    'cv_submission', 'job_application', 'contact_submission', 
    'career_partner_request', 'employer_job_submission', 'talent_request',
    'staff_added', 'permission_changed', 'blog_published', 
    'system_updates', 'weekly_digest'
  ];
  event_type text;
  pref_record record;
  current_prefs jsonb;
  updated_prefs jsonb;
BEGIN
  -- Loop through all notification preferences
  FOR pref_record IN SELECT id, event_preferences FROM notification_preferences LOOP
    current_prefs := COALESCE(pref_record.event_preferences, '{}'::jsonb);
    updated_prefs := current_prefs;
    
    -- Add any missing event types with default false
    FOREACH event_type IN ARRAY all_event_types LOOP
      IF NOT (current_prefs ? event_type) THEN
        updated_prefs := updated_prefs || jsonb_build_object(event_type, false);
      END IF;
    END LOOP;
    
    -- Update if changes were made
    IF updated_prefs != current_prefs THEN
      UPDATE notification_preferences 
      SET event_preferences = updated_prefs, updated_at = now()
      WHERE id = pref_record.id;
    END IF;
  END LOOP;
END;
$$;

-- Run the sync function once to update existing preferences
SELECT sync_notification_event_types();

-- Create a trigger function that syncs new event types on insert/update of admin profiles
-- This ensures new staff get proper preferences when created outside the edge function
CREATE OR REPLACE FUNCTION public.ensure_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_defaults jsonb;
BEGIN
  -- Check if notification preferences exist for this user
  IF NOT EXISTS (SELECT 1 FROM notification_preferences WHERE user_id = NEW.user_id) THEN
    -- Get role-based defaults
    role_defaults := CASE NEW.role
      WHEN 'admin' THEN '{"cv_submission": true, "job_application": true, "contact_submission": true, "career_partner_request": true, "employer_job_submission": true, "talent_request": true, "staff_added": true, "permission_changed": true, "blog_published": true, "system_updates": true, "weekly_digest": true}'::jsonb
      WHEN 'recruiter' THEN '{"cv_submission": true, "job_application": true, "contact_submission": false, "career_partner_request": false, "employer_job_submission": true, "talent_request": true, "staff_added": false, "permission_changed": true, "blog_published": false, "system_updates": true, "weekly_digest": false}'::jsonb
      WHEN 'account_manager' THEN '{"cv_submission": false, "job_application": false, "contact_submission": true, "career_partner_request": true, "employer_job_submission": true, "talent_request": true, "staff_added": false, "permission_changed": true, "blog_published": false, "system_updates": true, "weekly_digest": true}'::jsonb
      WHEN 'marketing' THEN '{"cv_submission": false, "job_application": false, "contact_submission": false, "career_partner_request": false, "employer_job_submission": false, "talent_request": false, "staff_added": false, "permission_changed": true, "blog_published": true, "system_updates": true, "weekly_digest": false}'::jsonb
      WHEN 'cv_uploader' THEN '{"cv_submission": true, "job_application": false, "contact_submission": false, "career_partner_request": false, "employer_job_submission": false, "talent_request": false, "staff_added": false, "permission_changed": true, "blog_published": false, "system_updates": true, "weekly_digest": false}'::jsonb
      ELSE '{"cv_submission": false, "job_application": false, "contact_submission": false, "career_partner_request": false, "employer_job_submission": false, "talent_request": false, "staff_added": false, "permission_changed": true, "blog_published": false, "system_updates": true, "weekly_digest": false}'::jsonb
    END;
    
    -- Insert notification preferences with role-based defaults
    INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, in_app_enabled, event_preferences)
    VALUES (NEW.user_id, true, true, true, role_defaults)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add unique constraint on user_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notification_preferences_user_id_key'
  ) THEN
    ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create trigger to ensure notification preferences on admin profile creation
DROP TRIGGER IF EXISTS ensure_notification_prefs_trigger ON admin_profiles;
CREATE TRIGGER ensure_notification_prefs_trigger
AFTER INSERT ON admin_profiles
FOR EACH ROW
EXECUTE FUNCTION ensure_notification_preferences();