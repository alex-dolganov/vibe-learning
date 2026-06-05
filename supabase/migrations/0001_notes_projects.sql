-- Build&Vibe — таблицы для разделов «Заметки» и «Мои проекты».
-- Выполнить один раз в Supabase → SQL Editor.
-- Приватность обеспечивается RLS: каждый пользователь видит только свои строки.

-- ── NOTES (канбан) ──
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  status text not null default 'idea',           -- idea | doing | done
  position double precision not null default 0,   -- порядок внутри колонки
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

drop policy if exists "notes are private" on public.notes;
create policy "notes are private" on public.notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Табличные привилегии для роли залогиненного пользователя (RLS всё равно ограничивает строки).
grant select, insert, update, delete on public.notes to authenticated;

create index if not exists notes_user_idx on public.notes (user_id, status, position);

-- ── PROJECTS ──
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null default '',
  description text not null default '',
  stack text[] not null default '{}',             -- ['React','Vite','Node']
  status text not null default 'active',          -- idea | active | done | archived
  link text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "projects are private" on public.projects;
create policy "projects are private" on public.projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.projects to authenticated;

create index if not exists projects_user_idx on public.projects (user_id, created_at desc);
