ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS d3_no_generation_sent_at  timestamptz,
  ADD COLUMN IF NOT EXISTS d7_no_conversion_sent_at  timestamptz;
