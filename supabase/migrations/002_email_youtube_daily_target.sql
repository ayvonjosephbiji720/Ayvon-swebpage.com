-- ============================================================================
-- Migration 002 — Email reminders, Daily Blessings, Smart Daily Target
-- Run this in the Supabase SQL editor if you already ran the original
-- supabase/schema.sql. (If you're setting up a brand new project instead,
-- just run supabase/schema.sql — it already includes everything below.)
-- Safe to re-run.
-- ============================================================================

-- New column on jobs: which of the 25 IT job categories this application
-- counts toward for the Smart Daily Target.
alter table public.jobs add column if not exists job_category text;

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
-- Row Level Security for the 3 new tables
-- ---------------------------------------------------------------------------
alter table public.email_reminder_settings enable row level security;
alter table public.email_reminder_log enable row level security;
alter table public.daily_targets enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['email_reminder_settings','email_reminder_log','daily_targets']
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
-- Realtime (optional): live-update Daily Target across tabs/devices
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['daily_targets','email_reminder_settings']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%1$s', t);
    exception when duplicate_object then
      null;
    end;
  end loop;
end $$;
