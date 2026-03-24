-- Atomic generation counter increment
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/yaxobfplnbbthkbspyal/sql

CREATE OR REPLACE FUNCTION increment_generation_count(user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE users
  SET generation_count = generation_count + 1
  WHERE id = user_id
  RETURNING generation_count;
$$;
