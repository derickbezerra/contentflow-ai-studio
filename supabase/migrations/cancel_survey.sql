-- ContentFlow — Cancel Survey Migration
-- Run this in Supabase SQL Editor

create table if not exists public.cancel_surveys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  reason text not null check (reason in ('preco', 'nao_uso', 'falta_feature', 'outro')),
  comment text,
  created_at timestamptz default now()
);

alter table public.cancel_surveys enable row level security;

drop policy if exists "Users can insert own cancel survey" on public.cancel_surveys;
create policy "Users can insert own cancel survey"
  on public.cancel_surveys for insert
  with check (auth.uid() = user_id);
