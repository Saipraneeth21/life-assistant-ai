-- Life Assistant AI — Supabase schema
-- Run this in your Supabase SQL editor

-- Tasks table
create table if not exists tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  title      text not null,
  description text,
  priority   text not null check (priority in ('low', 'medium', 'high')) default 'medium',
  status     text not null check (status in ('pending', 'in_progress', 'done')) default 'pending',
  due_date   date,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on tasks (user_id);
create index if not exists tasks_status_idx  on tasks (status);

-- Reminders table
create table if not exists reminders (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  title      text not null,
  remind_at  timestamptz not null,
  recurring  text check (recurring in ('daily', 'weekly')),
  done       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx  on reminders (user_id);
create index if not exists reminders_remind_at_idx on reminders (remind_at);

-- Row Level Security (enable when using real auth)
-- alter table tasks    enable row level security;
-- alter table reminders enable row level security;

-- Example RLS policies (uncomment when Supabase Auth is integrated):
-- create policy "Users can manage own tasks"
--   on tasks for all using (auth.uid()::text = user_id);
-- create policy "Users can manage own reminders"
--   on reminders for all using (auth.uid()::text = user_id);
