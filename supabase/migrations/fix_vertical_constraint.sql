-- Fix: vertical CHECK constraint had old values ('doctor', 'lawyer', 'infoproduct')
-- but the app sends health-specific values. This drops the stale constraint and
-- adds the correct one. Run in Supabase SQL Editor.

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_vertical_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_vertical_check
    CHECK (vertical IN ('doctor', 'nutritionist', 'dentist', 'psychologist'));
