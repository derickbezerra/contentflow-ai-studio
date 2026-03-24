-- Stripe subscription detail columns
-- Referenced by stripe-webhook edge function and try_increment_generation_v2

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS payment_status       text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_period_end   timestamptz;
