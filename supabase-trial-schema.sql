-- ContentFlow — Trial Schema Migration
-- Run this in Supabase SQL Editor

-- Add trial_ends_at column
alter table public.users
  add column if not exists trial_ends_at timestamptz;

-- Set trial for existing users who don't have a plan yet
update public.users
  set trial_ends_at = now() + interval '7 days'
  where trial_ends_at is null and plan = 'free';

-- Update trigger to set trial on new signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, trial_ends_at)
  values (new.id, new.email, now() + interval '7 days');
  return new;
end;
$$ language plpgsql security definer;
