-- ============================================================================
-- Discipline — initial schema
-- ============================================================================
-- Apply via:
--   supabase db reset           (local, wipes everything)
--   or paste into Supabase Studio → SQL Editor for a hosted project
--
-- Every table has user_id + RLS so rows are scoped to auth.uid().
-- Timestamps use timestamptz. Dates that are inherently "calendar day"
-- (e.g. reading_sessions.read_on) use date.
-- ============================================================================

-- pgcrypto provides gen_random_uuid(); Supabase enables it by default but
-- we'll be explicit.
create extension if not exists "pgcrypto";

-- ============================================================================
-- WORKOUTS
-- ============================================================================

create table exercises (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  category      text,                         -- 'push' | 'pull' | 'legs' | 'core' | 'cardio' | free-form
  default_unit  text not null default 'lb',   -- 'lb' | 'kg' | 'bodyweight'
  notes         text,
  archived      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index exercises_user_idx on exercises(user_id) where archived = false;

create table workout_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  notes       text,
  created_at  timestamptz not null default now()
);

create index workout_sessions_user_started_idx
  on workout_sessions(user_id, started_at desc);

create table sets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  session_id    uuid not null references workout_sessions(id) on delete cascade,
  exercise_id   uuid not null references exercises(id) on delete restrict,
  set_number    int  not null,
  weight        numeric,         -- null for bodyweight
  reps          int,
  rpe           numeric,         -- optional 1-10 rate of perceived exertion
  is_warmup     boolean not null default false,
  notes         text,
  performed_at  timestamptz not null default now()
);

create index sets_session_idx on sets(session_id, set_number);
create index sets_user_exercise_idx on sets(user_id, exercise_id, performed_at desc);

-- ============================================================================
-- PEPTIDES
-- ============================================================================

create table peptides (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  default_dose  numeric,
  dose_unit     text not null default 'mg',  -- 'mg' | 'mcg' | 'iu'
  notes         text,
  archived      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index peptides_user_idx on peptides(user_id) where archived = false;

create table peptide_cycles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  peptide_id  uuid not null references peptides(id) on delete restrict,
  start_date  date not null,
  end_date    date,                -- null = ongoing
  dose        numeric,
  dose_unit   text,
  frequency   text,                -- free text: 'daily', '5-on-2-off', 'M/W/F', etc.
  notes       text,
  created_at  timestamptz not null default now(),
  constraint  peptide_cycles_dates_valid check (end_date is null or end_date >= start_date)
);

create index peptide_cycles_user_active_idx
  on peptide_cycles(user_id, start_date desc);

create table peptide_doses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  cycle_id       uuid not null references peptide_cycles(id) on delete cascade,
  taken_at       timestamptz not null default now(),
  amount         numeric,
  amount_unit    text,
  side_effects   text,
  notes          text
);

create index peptide_doses_cycle_idx on peptide_doses(cycle_id, taken_at desc);
create index peptide_doses_user_taken_idx on peptide_doses(user_id, taken_at desc);

-- ============================================================================
-- READING
-- ============================================================================

create table books (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  title              text not null,
  author             text,
  total_pages        int,
  status             text not null default 'reading',   -- 'wishlist' | 'reading' | 'paused' | 'finished' | 'dnf'
  started_at         date,
  finished_at        date,
  target_finish_date date,
  notes              text,
  created_at         timestamptz not null default now(),
  constraint books_status_valid check (status in ('wishlist','reading','paused','finished','dnf'))
);

create index books_user_status_idx on books(user_id, status);

create table reading_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  book_id           uuid not null references books(id) on delete cascade,
  read_on           date not null default current_date,
  pages_read        int,
  duration_minutes  int,
  notes             text,
  created_at        timestamptz not null default now()
);

create index reading_sessions_user_date_idx
  on reading_sessions(user_id, read_on desc);
create index reading_sessions_book_idx on reading_sessions(book_id, read_on desc);

-- ============================================================================
-- DAILY ACTIVITY VIEW
-- ----------------------------------------------------------------------------
-- Unified per-day rollup for streak calculations and the dashboard.
-- Returns one row per (user_id, day) where *something* happened, with
-- boolean flags indicating which domains had activity.
-- ============================================================================

create or replace view daily_activity as
select
  user_id,
  activity_date,
  bool_or(had_workout) as had_workout,
  bool_or(had_peptide) as had_peptide,
  bool_or(had_reading) as had_reading
from (
  select user_id, (started_at at time zone 'UTC')::date as activity_date,
         true  as had_workout, false as had_peptide, false as had_reading
  from workout_sessions

  union all

  select user_id, (taken_at at time zone 'UTC')::date,
         false, true, false
  from peptide_doses

  union all

  select user_id, read_on,
         false, false, true
  from reading_sessions
) t
group by user_id, activity_date;

-- Note: the view inherits RLS from its underlying tables — no separate
-- policy needed. A user will only see rows where they own the source data.

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table exercises         enable row level security;
alter table workout_sessions  enable row level security;
alter table sets              enable row level security;
alter table peptides          enable row level security;
alter table peptide_cycles    enable row level security;
alter table peptide_doses     enable row level security;
alter table books             enable row level security;
alter table reading_sessions  enable row level security;

-- Reusable policy pattern: owner can do everything with their own rows.
-- We create one FOR ALL policy per table rather than four per table;
-- this keeps the schema readable. Split them if you later need finer control.

create policy "own rows" on exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows" on workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows" on sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows" on peptides
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows" on peptide_cycles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows" on peptide_doses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows" on books
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows" on reading_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
