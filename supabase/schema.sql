-- ============================================================================
-- Personal Job Tracker & Productivity Dashboard — Supabase schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- Safe to re-run: uses "create table if not exists" and "drop policy if exists".
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  job_title text not null,
  job_location text,
  job_type text,
  salary text,
  website text,
  application_link text,
  date_applied timestamptz not null default now(),
  status text not null default 'Applied',
  contact_person text,
  recruiter_email text,
  recruiter_phone text,
  notes text,
  resume_version text,
  cover_letter_version text,
  job_category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_user_id_idx on public.jobs(user_id);
create index if not exists jobs_status_idx on public.jobs(status);
create index if not exists jobs_date_applied_idx on public.jobs(date_applied desc);

-- ---------------------------------------------------------------------------
-- calendar_events
-- ---------------------------------------------------------------------------
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null default 'Personal',
  start_time timestamptz not null,
  end_time timestamptz,
  all_day boolean not null default false,
  location text,
  notes text,
  job_id uuid references public.jobs(id) on delete set null,
  reminder_minutes_before integer default 30,
  created_at timestamptz not null default now()
);

create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);
create index if not exists calendar_events_start_time_idx on public.calendar_events(start_time);

-- ---------------------------------------------------------------------------
-- tasks (smart daily to-do list)
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  due_date date default current_date,
  completed boolean not null default false,
  is_auto_suggested boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

-- ---------------------------------------------------------------------------
-- study_sessions
-- ---------------------------------------------------------------------------
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  topic text,
  hours numeric(5,2) not null default 0,
  completed boolean not null default false,
  session_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists study_sessions_user_id_idx on public.study_sessions(user_id);
create index if not exists study_sessions_date_idx on public.study_sessions(session_date);

-- ---------------------------------------------------------------------------
-- prayer_notes
-- ---------------------------------------------------------------------------
create table if not exists public.prayer_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_date date not null default current_date,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists prayer_notes_user_id_idx on public.prayer_notes(user_id);

-- ---------------------------------------------------------------------------
-- prayer_times (reminder settings)
-- ---------------------------------------------------------------------------
create table if not exists public.prayer_times (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  time_of_day time not null,
  enabled boolean not null default true
);

create index if not exists prayer_times_user_id_idx on public.prayer_times(user_id);

-- ---------------------------------------------------------------------------
-- prayer_streaks (one row per day prayed, for streak analytics)
-- ---------------------------------------------------------------------------
create table if not exists public.prayer_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prayed_date date not null default current_date,
  unique (user_id, prayed_date)
);

create index if not exists prayer_streaks_user_id_idx on public.prayer_streaks(user_id);

-- ---------------------------------------------------------------------------
-- email_reminder_settings (one row per user: interview email reminders on/off)
-- ---------------------------------------------------------------------------
create table if not exists public.email_reminder_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- email_reminder_log (prevents duplicate reminder emails for the same event)
-- ---------------------------------------------------------------------------
create table if not exists public.email_reminder_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calendar_event_id uuid not null references public.calendar_events(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('1_day', '1_hour')),
  sent_at timestamptz not null default now(),
  unique (calendar_event_id, reminder_type)
);

create index if not exists email_reminder_log_user_id_idx on public.email_reminder_log(user_id);

-- ---------------------------------------------------------------------------
-- daily_targets (Smart Daily Target: today's job-category goals)
-- ---------------------------------------------------------------------------
create table if not exists public.daily_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_date date not null default current_date,
  categories jsonb not null default '[]'::jsonb,
  total_goal integer not null default 15,
  created_at timestamptz not null default now(),
  unique (user_id, target_date)
);

create index if not exists daily_targets_user_id_idx on public.daily_targets(user_id);
create index if not exists daily_targets_date_idx on public.daily_targets(target_date desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger for jobs
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — every user can only ever see/edit their own rows
-- ---------------------------------------------------------------------------
alter table public.jobs enable row level security;
alter table public.calendar_events enable row level security;
alter table public.tasks enable row level security;
alter table public.study_sessions enable row level security;
alter table public.prayer_notes enable row level security;
alter table public.prayer_times enable row level security;
alter table public.prayer_streaks enable row level security;
alter table public.email_reminder_settings enable row level security;
alter table public.email_reminder_log enable row level security;
alter table public.daily_targets enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['jobs','calendar_events','tasks','study_sessions','prayer_notes','prayer_times','prayer_streaks','email_reminder_settings','email_reminder_log','daily_targets']
  loop
    execute format('drop policy if exists "select_own_%1$s" on public.%1$s', t);
    execute format('drop policy if exists "insert_own_%1$s" on public.%1$s', t);
    execute format('drop policy if exists "update_own_%1$s" on public.%1$s', t);
    execute format('drop policy if exists "delete_own_%1$s" on public.%1$s', t);

    execute format('create policy "select_own_%1$s" on public.%1$s for select using (auth.uid() = user_id)', t);
    execute format('create policy "insert_own_%1$s" on public.%1$s for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "update_own_%1$s" on public.%1$s for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "delete_own_%1$s" on public.%1$s for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Realtime (optional): allows the dashboard to live-update across tabs/devices
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['jobs','calendar_events','tasks','study_sessions','prayer_notes','prayer_streaks','daily_targets','email_reminder_settings']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%1$s', t);
    exception when duplicate_object then
      null;
    end;
  end loop;
end $$;
