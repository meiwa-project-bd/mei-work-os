-- MEI Work OS — database schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query) after
-- creating your Supabase project. Safe to re-run: uses IF NOT EXISTS guards.

create extension if not exists "pgcrypto";

-- Shared trigger: keep updated_at current on every row update.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================================================
-- projects
-- =========================================================================
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'Active'
    check (status in ('Active', 'Waiting', 'Completed', 'Paused', 'Cancelled')),
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Critical')),
  owner text,
  start_date date not null default current_date,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists projects_user_id_idx on projects(user_id);
create index if not exists projects_status_idx on projects(status);

-- One active project per name per user. Lets a future Excel importer safely
-- "find or create project by name" (upsert on this constraint) instead of
-- creating duplicate projects on repeated imports. Soft-deleted projects are
-- excluded so a deleted name can be reused.
create unique index if not exists projects_user_id_name_active_idx
  on projects(user_id, name)
  where deleted_at is null;

drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

alter table projects enable row level security;

drop policy if exists "projects_select_own" on projects;
create policy "projects_select_own" on projects for select using (auth.uid() = user_id);
drop policy if exists "projects_insert_own" on projects;
create policy "projects_insert_own" on projects for insert with check (auth.uid() = user_id);
drop policy if exists "projects_update_own" on projects;
create policy "projects_update_own" on projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "projects_delete_own" on projects;
create policy "projects_delete_own" on projects for delete using (auth.uid() = user_id);

-- =========================================================================
-- work_logs
-- =========================================================================
create table if not exists work_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_date date not null default current_date,
  project_id uuid references projects(id) on delete set null,
  category text not null
    check (category in (
      'Planning', 'Design', 'Coding', 'Testing', 'Deployment',
      'Support', 'Meeting', 'Documentation', 'Research', 'Admin'
    )),
  title text not null,
  description text,
  start_time time,
  end_time time,
  duration_minutes integer,
  status text not null default 'Planned'
    check (status in ('Planned', 'In Progress', 'Done', 'Waiting', 'Blocked', 'Cancelled')),
  result text,
  blocker text,
  next_action text,
  evidence_url text,
  boss_visible boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists work_logs_user_id_idx on work_logs(user_id);
create index if not exists work_logs_work_date_idx on work_logs(work_date);
create index if not exists work_logs_project_id_idx on work_logs(project_id);
create index if not exists work_logs_status_idx on work_logs(status);

drop trigger if exists work_logs_set_updated_at on work_logs;
create trigger work_logs_set_updated_at
  before update on work_logs
  for each row execute function set_updated_at();

-- Auto-calculate duration_minutes whenever both start_time and end_time are
-- present. If end_time is earlier than start_time, treat it as crossing
-- midnight (e.g. 23:00 -> 01:00 = 120 minutes).
create or replace function work_logs_calc_duration()
returns trigger as $$
begin
  if new.start_time is not null and new.end_time is not null then
    if new.end_time >= new.start_time then
      new.duration_minutes := round(extract(epoch from (new.end_time - new.start_time)) / 60);
    else
      new.duration_minutes := round(extract(epoch from (new.end_time - new.start_time + interval '24 hours')) / 60);
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists work_logs_duration_trigger on work_logs;
create trigger work_logs_duration_trigger
  before insert or update on work_logs
  for each row execute function work_logs_calc_duration();

alter table work_logs enable row level security;

drop policy if exists "work_logs_select_own" on work_logs;
create policy "work_logs_select_own" on work_logs for select using (auth.uid() = user_id);
drop policy if exists "work_logs_insert_own" on work_logs;
create policy "work_logs_insert_own" on work_logs for insert with check (auth.uid() = user_id);
drop policy if exists "work_logs_update_own" on work_logs;
create policy "work_logs_update_own" on work_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "work_logs_delete_own" on work_logs;
create policy "work_logs_delete_own" on work_logs for delete using (auth.uid() = user_id);

-- =========================================================================
-- people
-- =========================================================================
create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text,
  company_section text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists people_user_id_idx on people(user_id);

drop trigger if exists people_set_updated_at on people;
create trigger people_set_updated_at
  before update on people
  for each row execute function set_updated_at();

alter table people enable row level security;

drop policy if exists "people_select_own" on people;
create policy "people_select_own" on people for select using (auth.uid() = user_id);
drop policy if exists "people_insert_own" on people;
create policy "people_insert_own" on people for insert with check (auth.uid() = user_id);
drop policy if exists "people_update_own" on people;
create policy "people_update_own" on people for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "people_delete_own" on people;
create policy "people_delete_own" on people for delete using (auth.uid() = user_id);

-- =========================================================================
-- work_log_people (join table: who a work log involves, and how)
-- =========================================================================
create table if not exists work_log_people (
  id uuid primary key default gen_random_uuid(),
  work_log_id uuid not null references work_logs(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  relationship_type text
    check (relationship_type in (
      'waiting_for', 'discussed_with', 'assigned_by', 'supported_user', 'reviewer'
    ))
);

create index if not exists work_log_people_work_log_id_idx on work_log_people(work_log_id);
create index if not exists work_log_people_person_id_idx on work_log_people(person_id);

alter table work_log_people enable row level security;

-- No user_id column here — access is scoped through the parent work_log's owner.
drop policy if exists "work_log_people_select_own" on work_log_people;
create policy "work_log_people_select_own" on work_log_people for select using (
  exists (select 1 from work_logs w where w.id = work_log_id and w.user_id = auth.uid())
);
drop policy if exists "work_log_people_insert_own" on work_log_people;
create policy "work_log_people_insert_own" on work_log_people for insert with check (
  exists (select 1 from work_logs w where w.id = work_log_id and w.user_id = auth.uid())
);
drop policy if exists "work_log_people_update_own" on work_log_people;
create policy "work_log_people_update_own" on work_log_people for update using (
  exists (select 1 from work_logs w where w.id = work_log_id and w.user_id = auth.uid())
);
drop policy if exists "work_log_people_delete_own" on work_log_people;
create policy "work_log_people_delete_own" on work_log_people for delete using (
  exists (select 1 from work_logs w where w.id = work_log_id and w.user_id = auth.uid())
);

-- =========================================================================
-- attachments
-- =========================================================================
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_log_id uuid not null references work_logs(id) on delete cascade,
  type text not null
    check (type in ('screenshot', 'github', 'drive', 'email', 'line', 'document', 'other')),
  title text not null,
  url text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists attachments_user_id_idx on attachments(user_id);
create index if not exists attachments_work_log_id_idx on attachments(work_log_id);

drop trigger if exists attachments_set_updated_at on attachments;
create trigger attachments_set_updated_at
  before update on attachments
  for each row execute function set_updated_at();

alter table attachments enable row level security;

drop policy if exists "attachments_select_own" on attachments;
create policy "attachments_select_own" on attachments for select using (auth.uid() = user_id);
drop policy if exists "attachments_insert_own" on attachments;
create policy "attachments_insert_own" on attachments for insert with check (auth.uid() = user_id);
drop policy if exists "attachments_update_own" on attachments;
create policy "attachments_update_own" on attachments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "attachments_delete_own" on attachments;
create policy "attachments_delete_own" on attachments for delete using (auth.uid() = user_id);
