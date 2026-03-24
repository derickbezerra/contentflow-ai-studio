-- ContentFlow Database Schema
-- Run this in Supabase SQL Editor

-- Users profile table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  vertical text check (vertical in ('doctor', 'lawyer', 'infoproduct')),
  created_at timestamptz default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Content table
create table if not exists public.content (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('carousel', 'post', 'story')),
  input text not null,
  output_json jsonb not null,
  created_at timestamptz default now()
);

alter table public.content enable row level security;

drop policy if exists "Users can read own content" on public.content;
create policy "Users can read own content"
  on public.content for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own content" on public.content;
create policy "Users can insert own content"
  on public.content for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own content" on public.content;
create policy "Users can delete own content"
  on public.content for delete
  using (auth.uid() = user_id);

-- Index for fast user lookups
create index if not exists content_user_id_created_at_idx
  on public.content (user_id, created_at desc);
