-- Schedule lifecycle-emails edge function every 15 minutes via pg_cron + pg_net
-- Requires: pg_cron and pg_net extensions enabled on the project

SELECT cron.schedule(
  'lifecycle-emails',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url     := (SELECT value FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/lifecycle-emails',
    headers := jsonb_build_object(
      'Content-Type',    'application/json',
      'x-cron-secret',   (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET')
    ),
    body    := '{}'::jsonb
  );
  $$
);
