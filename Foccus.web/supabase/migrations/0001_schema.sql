-- Foccus.web — schema inicial
-- Roda no SQL Editor do Supabase (Database > SQL Editor > New query), nesta ordem
-- (0001 -> 0002 -> 0003 -> 0004 -> 0005).

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin','user')),
  user_name text not null default '',
  theme text not null default 'light' check (theme in ('light','dark')),
  asst_gargalo_ativo boolean not null default true,
  asst_gargalo_limite integer not null default 10,
  asst_quickwin_ativo boolean not null default true,
  asst_fechamento_ativo boolean not null default true,
  asst_fechamento_hora text not null default '17:30',
  asst_limpeza_ativo boolean not null default true,
  asst_limpeza_dias integer not null default 30,
  assistant_banner_dismissed_date date,
  gargalo_combo_count integer not null default 0,
  gargalo_combo_date date,
  quick_win_dismissed_date date,
  limpeza_dismissed_date date,
  last_activity_at timestamptz,
  fechamento_shown_date date,
  fechamento_streak integer not null default 0,
  fechamento_last_date date,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  priority text not null default 'P3' check (priority in ('P1','P2','P3','P4')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','PAUSED','COMPLETED','ARCHIVED')),
  color text not null default '#6366f1',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_user_idx on public.projects(user_id);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now()
);
create index people_user_idx on public.people(user_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  notes text,
  tags text[] not null default '{}',
  checklist jsonb not null default '[]',
  follow_up_date date,
  waiting_for uuid references public.people(id) on delete set null,
  waiting_reason text,
  blocked_by text,
  depends_on_task_id uuid references public.tasks(id) on delete set null,
  estimated_minutes integer,
  progress_pct integer not null default 0 check (progress_pct between 0 and 100),
  due_date date,
  priority text not null default 'P3' check (priority in ('P1','P2','P3','P4')),
  status text not null default 'INBOX' check (status in ('INBOX','TODO','IN_PROGRESS','WAITING','BLOCKED','DONE','CANCELLED')),
  parent_task_id uuid references public.tasks(id) on delete set null,
  history jsonb not null default '[]',
  comments jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index tasks_user_status_idx on public.tasks(user_id, status);
create index tasks_user_project_idx on public.tasks(user_id, project_id);
create index tasks_user_due_idx on public.tasks(user_id, due_date);

create table public.project_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text,
  text text not null,
  recorded_at timestamptz not null default now(),
  reference_date date
);
create index project_notes_user_idx on public.project_notes(user_id);
