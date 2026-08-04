-- Phase 6A - Automatic Work Tracker Foundation
-- Run after database/schema.sql for existing Supabase projects.

create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================================================
-- work_sessions
-- =========================================================================
create table if not exists work_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  work_log_id uuid references work_logs(id) on delete set null,
  title text not null,
  tool text not null,
  app_name text,
  window_title text,
  repo_path text,
  branch_name text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer,
  idle_minutes integer not null default 0,
  active_minutes integer,
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'cancelled')),
  source text not null default 'local_agent'
    check (source in ('manual', 'local_agent', 'cli_wrapper')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists work_sessions_user_id_idx on work_sessions(user_id);
create index if not exists work_sessions_project_id_idx on work_sessions(project_id);
create index if not exists work_sessions_work_log_id_idx on work_sessions(work_log_id);
create index if not exists work_sessions_started_at_idx on work_sessions(started_at);
create index if not exists work_sessions_status_idx on work_sessions(status);
create index if not exists work_sessions_tool_idx on work_sessions(tool);

drop trigger if exists work_sessions_set_updated_at on work_sessions;
create trigger work_sessions_set_updated_at
  before update on work_sessions
  for each row execute function set_updated_at();

alter table work_sessions enable row level security;

drop policy if exists "work_sessions_select_own" on work_sessions;
create policy "work_sessions_select_own" on work_sessions for select using (auth.uid() = user_id);

drop policy if exists "work_sessions_insert_own" on work_sessions;
create policy "work_sessions_insert_own" on work_sessions for insert with check (
  auth.uid() = user_id
  and (
    project_id is null
    or exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid())
  )
  and (
    work_log_id is null
    or exists (select 1 from work_logs w where w.id = work_log_id and w.user_id = auth.uid())
  )
);

drop policy if exists "work_sessions_update_own" on work_sessions;
create policy "work_sessions_update_own" on work_sessions for update using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
  and (
    project_id is null
    or exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid())
  )
  and (
    work_log_id is null
    or exists (select 1 from work_logs w where w.id = work_log_id and w.user_id = auth.uid())
  )
);

drop policy if exists "work_sessions_delete_own" on work_sessions;
create policy "work_sessions_delete_own" on work_sessions for delete using (auth.uid() = user_id);

-- =========================================================================
-- evidence_items
-- =========================================================================
create table if not exists evidence_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_session_id uuid references work_sessions(id) on delete set null,
  work_log_id uuid references work_logs(id) on delete set null,
  type text not null
    check (type in (
      'commit', 'command', 'build', 'test', 'screenshot', 'file',
      'report', 'limit_event', 'note', 'other'
    )),
  title text not null,
  url text,
  content text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists evidence_items_user_id_idx on evidence_items(user_id);
create index if not exists evidence_items_work_session_id_idx on evidence_items(work_session_id);
create index if not exists evidence_items_work_log_id_idx on evidence_items(work_log_id);
create index if not exists evidence_items_created_at_idx on evidence_items(created_at);
create index if not exists evidence_items_type_idx on evidence_items(type);

drop trigger if exists evidence_items_set_updated_at on evidence_items;
create trigger evidence_items_set_updated_at
  before update on evidence_items
  for each row execute function set_updated_at();

alter table evidence_items enable row level security;

drop policy if exists "evidence_items_select_own" on evidence_items;
create policy "evidence_items_select_own" on evidence_items for select using (auth.uid() = user_id);

drop policy if exists "evidence_items_insert_own" on evidence_items;
create policy "evidence_items_insert_own" on evidence_items for insert with check (
  auth.uid() = user_id
  and (
    work_session_id is null
    or exists (
      select 1 from work_sessions s where s.id = work_session_id and s.user_id = auth.uid()
    )
  )
  and (
    work_log_id is null
    or exists (select 1 from work_logs w where w.id = work_log_id and w.user_id = auth.uid())
  )
);

drop policy if exists "evidence_items_update_own" on evidence_items;
create policy "evidence_items_update_own" on evidence_items for update using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
  and (
    work_session_id is null
    or exists (
      select 1 from work_sessions s where s.id = work_session_id and s.user_id = auth.uid()
    )
  )
  and (
    work_log_id is null
    or exists (select 1 from work_logs w where w.id = work_log_id and w.user_id = auth.uid())
  )
);

drop policy if exists "evidence_items_delete_own" on evidence_items;
create policy "evidence_items_delete_own" on evidence_items for delete using (auth.uid() = user_id);

-- =========================================================================
-- ai_usage_events
-- =========================================================================
create table if not exists ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_session_id uuid references work_sessions(id) on delete set null,
  provider text not null
    check (provider in ('OpenAI', 'Anthropic', 'Other')),
  tool text not null
    check (tool in ('ChatGPT', 'Codex', 'Claude Code', 'Other')),
  model_name text,
  event_type text not null
    check (event_type in (
      'model_detected', 'limit_warning', 'limit_reached',
      'reset_time_detected', 'usage_snapshot', 'other'
    )),
  detected_text text,
  reset_at timestamptz,
  remaining_text text,
  source text not null
    check (source in ('cli_output', 'manual', 'api', 'local_agent')),
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ai_usage_events_user_id_idx on ai_usage_events(user_id);
create index if not exists ai_usage_events_work_session_id_idx on ai_usage_events(work_session_id);
create index if not exists ai_usage_events_captured_at_idx on ai_usage_events(captured_at);
create index if not exists ai_usage_events_provider_tool_idx on ai_usage_events(provider, tool);
create index if not exists ai_usage_events_event_type_idx on ai_usage_events(event_type);

drop trigger if exists ai_usage_events_set_updated_at on ai_usage_events;
create trigger ai_usage_events_set_updated_at
  before update on ai_usage_events
  for each row execute function set_updated_at();

alter table ai_usage_events enable row level security;

drop policy if exists "ai_usage_events_select_own" on ai_usage_events;
create policy "ai_usage_events_select_own" on ai_usage_events for select using (auth.uid() = user_id);

drop policy if exists "ai_usage_events_insert_own" on ai_usage_events;
create policy "ai_usage_events_insert_own" on ai_usage_events for insert with check (
  auth.uid() = user_id
  and (
    work_session_id is null
    or exists (
      select 1 from work_sessions s where s.id = work_session_id and s.user_id = auth.uid()
    )
  )
);

drop policy if exists "ai_usage_events_update_own" on ai_usage_events;
create policy "ai_usage_events_update_own" on ai_usage_events for update using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
  and (
    work_session_id is null
    or exists (
      select 1 from work_sessions s where s.id = work_session_id and s.user_id = auth.uid()
    )
  )
);

drop policy if exists "ai_usage_events_delete_own" on ai_usage_events;
create policy "ai_usage_events_delete_own" on ai_usage_events for delete using (auth.uid() = user_id);
