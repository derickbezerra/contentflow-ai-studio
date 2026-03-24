-- ContentFlow — Stripe Schema Migration
-- Run this in Supabase SQL Editor (after supabase-schema.sql)

alter table public.users
  add column if not exists plan text default 'free' check (plan in ('free', 'pro')),
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists generation_count int default 0,
  add column if not exists generation_reset_at timestamptz default (date_trunc('month', now()) + interval '1 month');
