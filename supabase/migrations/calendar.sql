-- ContentFlow — Calendário editorial
-- Run this in Supabase SQL Editor

-- Adiciona status e data planejada na tabela de conteúdo
alter table public.content
  add column if not exists status text not null default 'gerado'
    check (status in ('gerado', 'publicado')),
  add column if not exists scheduled_date date;

-- Permite usuário atualizar status e scheduled_date do próprio conteúdo
drop policy if exists "Users can update own content" on public.content;
create policy "Users can update own content"
  on public.content for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tabela de posts planejados (rascunhos sem conteúdo gerado)
create table if not exists public.planned_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null,
  content_type text not null check (content_type in ('carousel', 'post', 'story')),
  scheduled_date date not null,
  created_at timestamptz default now()
);

alter table public.planned_posts enable row level security;

drop policy if exists "Users can manage own planned posts" on public.planned_posts;
create policy "Users can manage own planned posts"
  on public.planned_posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists planned_posts_user_date_idx
  on public.planned_posts (user_id, scheduled_date);
