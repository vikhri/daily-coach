create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id text unique not null,
  telegram_chat_id text,
  display_name text,
  timezone text not null default 'Asia/Ho_Chi_Minh',
  reminder_time text not null default '21:00',
  goal_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  report_date date not null,
  water_glasses int not null default 0,
  breakfast_tags text[] not null default '{}',
  breakfast_note text,
  lunch_tags text[] not null default '{}',
  lunch_note text,
  dinner_tags text[] not null default '{}',
  dinner_note text,
  snacks_tags text[] not null default '{}',
  snacks_note text,
  activity_tags text[] not null default '{}',
  walking_minutes int not null default 0,
  steps int,
  running_minutes int not null default 0,
  home_workout_minutes int not null default 0,
  energy_level int,
  evening_hunger int,
  bloating_or_heaviness boolean not null default false,
  heat_or_dehydration_feeling boolean not null default false,
  difficulties_note text,
  weight_snapshot numeric(5,2),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, report_date)
);

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  weight_kg numeric(5,2) not null,
  note text,
  created_at timestamptz not null default now(),
  unique (profile_id, log_date)
);

create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.daily_reports(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  model text,
  what_good jsonb not null default '[]'::jsonb,
  what_to_improve jsonb not null default '[]'::jsonb,
  change_tomorrow jsonb not null default '[]'::jsonb,
  tomorrow_plan jsonb not null default '{}'::jsonb,
  risk_flags jsonb not null default '{}'::jsonb,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reminder_date date not null,
  sent_at timestamptz not null default now(),
  status text not null,
  unique (profile_id, reminder_date)
);

create index if not exists daily_reports_profile_date_idx
  on public.daily_reports(profile_id, report_date desc);

create index if not exists weight_logs_profile_date_idx
  on public.weight_logs(profile_id, log_date desc);

create index if not exists reminder_logs_profile_date_idx
  on public.reminder_logs(profile_id, reminder_date desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists daily_reports_set_updated_at on public.daily_reports;
create trigger daily_reports_set_updated_at
before update on public.daily_reports
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.daily_reports enable row level security;
alter table public.weight_logs enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.reminder_logs enable row level security;

create policy "service role full access profiles"
on public.profiles
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role full access reports"
on public.daily_reports
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role full access weight_logs"
on public.weight_logs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role full access ai_feedback"
on public.ai_feedback
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role full access reminder_logs"
on public.reminder_logs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

comment on table public.profiles is 'Production note: wire Telegram identity to profile and keep service role usage server-side only.';
comment on table public.reminder_logs is 'Production note: schedule POST /api/cron/reminders from Supabase cron or another trusted scheduler.';
