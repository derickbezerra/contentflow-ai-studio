-- ContentFlow — Plans Migration
-- Run this in Supabase SQL Editor

-- Update plan column to support new tiers
alter table public.users
  drop constraint if exists users_plan_check;

alter table public.users
  add constraint users_plan_check
  check (plan in ('free', 'starter', 'growth', 'pro'));
