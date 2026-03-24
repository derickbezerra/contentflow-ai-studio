-- Rate limiting per user
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/yaxobfplnbbthkbspyal/sql

-- 1. Add column to track last generation time
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_generated_at timestamptz;

-- 2. Atomic function: returns true if allowed, false if rate limited (min 10s between requests)
CREATE OR REPLACE FUNCTION check_and_set_rate_limit(user_id uuid, min_interval_seconds integer DEFAULT 10)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE users
  SET last_generated_at = now()
  WHERE id = user_id
    AND (last_generated_at IS NULL OR now() - last_generated_at > (min_interval_seconds || ' seconds')::interval)
  RETURNING true;
$$;
