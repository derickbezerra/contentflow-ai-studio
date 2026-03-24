-- Email tracking columns — prevents duplicate sends across lifecycle emails
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS welcome_sent_at        timestamptz,
  ADD COLUMN IF NOT EXISTS trial_d2_sent_at       timestamptz,
  ADD COLUMN IF NOT EXISTS trial_expired_sent_at  timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_email_sent_at   timestamptz;
