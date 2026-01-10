-- Enable required extensions for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule daily summary notification at 6 PM UTC every day
SELECT cron.schedule(
  'daily-summary-notification',
  '0 18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://yoegksjmdtubnkgdtttj.supabase.co/functions/v1/send-daily-summary',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);