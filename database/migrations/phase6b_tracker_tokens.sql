-- Phase 6B - Secure tracker tokens and token-authenticated tracker ingestion
-- Run after database/migrations/phase6_work_tracker.sql.

create extension if not exists "pgcrypto";

-- =========================================================================
-- tracker_tokens
-- =========================================================================
create table if not exists tracker_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists tracker_tokens_user_id_idx on tracker_tokens(user_id);
create index if not exists tracker_tokens_revoked_at_idx on tracker_tokens(revoked_at);

alter table tracker_tokens enable row level security;

drop policy if exists "tracker_tokens_select_own" on tracker_tokens;
create policy "tracker_tokens_select_own" on tracker_tokens
  for select using (auth.uid() = user_id);

drop policy if exists "tracker_tokens_insert_own" on tracker_tokens;
create policy "tracker_tokens_insert_own" on tracker_tokens
  for insert with check (auth.uid() = user_id);

drop policy if exists "tracker_tokens_update_own" on tracker_tokens;
create policy "tracker_tokens_update_own" on tracker_tokens
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tracker_tokens_delete_none" on tracker_tokens;
create policy "tracker_tokens_delete_none" on tracker_tokens
  for delete using (false);

-- Internal helper: verifies token, updates last_used_at, returns owner.
-- Do not grant this helper directly; public RPCs below perform scoped mutations.
create or replace function tracker_token_user_id(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_token_hash text;
begin
  if p_token is null or p_token = '' then
    return null;
  end if;

  v_token_hash := encode(extensions.digest(convert_to(p_token, 'UTF8'), 'sha256'), 'hex');

  update tracker_tokens
  set last_used_at = now()
  where token_hash = v_token_hash
    and revoked_at is null
  returning user_id into v_user_id;

  return v_user_id;
end;
$$;

revoke all on function tracker_token_user_id(text) from public;

create or replace function tracker_rpc_session_start(
  p_token text,
  p_project_id uuid default null,
  p_work_log_id uuid default null,
  p_title text default null,
  p_tool text default null,
  p_app_name text default null,
  p_window_title text default null,
  p_repo_path text default null,
  p_branch_name text default null,
  p_started_at timestamptz default null,
  p_idle_minutes integer default 0,
  p_active_minutes integer default null,
  p_duration_minutes integer default null,
  p_status text default 'active',
  p_source text default 'local_agent',
  p_notes text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_session_id uuid;
begin
  v_user_id := tracker_token_user_id(p_token);
  if v_user_id is null then
    raise exception 'Invalid tracker token' using errcode = '28000';
  end if;

  if p_project_id is not null and not exists (
    select 1 from projects p where p.id = p_project_id and p.user_id = v_user_id
  ) then
    raise exception 'Project not found' using errcode = 'P0002';
  end if;

  if p_work_log_id is not null and not exists (
    select 1 from work_logs w where w.id = p_work_log_id and w.user_id = v_user_id
  ) then
    raise exception 'Work log not found' using errcode = 'P0002';
  end if;

  insert into work_sessions (
    user_id, project_id, work_log_id, title, tool, app_name, window_title,
    repo_path, branch_name, started_at, idle_minutes, active_minutes,
    duration_minutes, status, source, notes
  )
  values (
    v_user_id,
    p_project_id,
    p_work_log_id,
    coalesce(nullif(p_title, ''), nullif(p_window_title, ''), 'Tracked work session'),
    coalesce(nullif(p_tool, ''), 'Other'),
    p_app_name,
    p_window_title,
    p_repo_path,
    p_branch_name,
    coalesce(p_started_at, now()),
    coalesce(greatest(p_idle_minutes, 0), 0),
    case when p_active_minutes is null then null else greatest(p_active_minutes, 0) end,
    case when p_duration_minutes is null then null else greatest(p_duration_minutes, 0) end,
    p_status,
    p_source,
    p_notes
  )
  returning id into v_session_id;

  return v_session_id;
end;
$$;

create or replace function tracker_rpc_session_heartbeat(
  p_token text,
  p_work_session_id uuid,
  p_app_name text default null,
  p_window_title text default null,
  p_repo_path text default null,
  p_branch_name text default null,
  p_status text default 'active',
  p_idle_minutes integer default null,
  p_active_minutes integer default null,
  p_duration_minutes integer default null,
  p_notes text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := tracker_token_user_id(p_token);
  if v_user_id is null then
    raise exception 'Invalid tracker token' using errcode = '28000';
  end if;

  update work_sessions
  set
    app_name = coalesce(p_app_name, app_name),
    window_title = coalesce(p_window_title, window_title),
    repo_path = coalesce(p_repo_path, repo_path),
    branch_name = coalesce(p_branch_name, branch_name),
    status = p_status,
    idle_minutes = coalesce(greatest(p_idle_minutes, 0), idle_minutes),
    active_minutes = coalesce(greatest(p_active_minutes, 0), active_minutes),
    duration_minutes = coalesce(greatest(p_duration_minutes, 0), duration_minutes),
    notes = coalesce(p_notes, notes)
  where id = p_work_session_id
    and user_id = v_user_id
    and deleted_at is null;

  if not found then
    raise exception 'Tracker session not found' using errcode = 'P0002';
  end if;

  return p_work_session_id;
end;
$$;

create or replace function tracker_rpc_session_end(
  p_token text,
  p_work_session_id uuid,
  p_ended_at timestamptz default null,
  p_duration_minutes integer default null,
  p_idle_minutes integer default 0,
  p_active_minutes integer default null,
  p_status text default 'completed',
  p_notes text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_ended_at timestamptz;
  v_duration integer;
begin
  v_user_id := tracker_token_user_id(p_token);
  if v_user_id is null then
    raise exception 'Invalid tracker token' using errcode = '28000';
  end if;

  v_ended_at := coalesce(p_ended_at, now());

  select coalesce(
    p_duration_minutes,
    greatest(0, round(extract(epoch from (v_ended_at - started_at)) / 60)::integer)
  )
  into v_duration
  from work_sessions
  where id = p_work_session_id
    and user_id = v_user_id
    and deleted_at is null;

  if v_duration is null then
    raise exception 'Tracker session not found' using errcode = 'P0002';
  end if;

  update work_sessions
  set
    ended_at = v_ended_at,
    duration_minutes = greatest(v_duration, 0),
    idle_minutes = coalesce(greatest(p_idle_minutes, 0), idle_minutes),
    active_minutes = coalesce(greatest(p_active_minutes, 0), greatest(v_duration, 0)),
    status = p_status,
    notes = coalesce(p_notes, notes)
  where id = p_work_session_id
    and user_id = v_user_id
    and deleted_at is null;

  return p_work_session_id;
end;
$$;

create or replace function tracker_rpc_evidence_added(
  p_token text,
  p_work_session_id uuid default null,
  p_work_log_id uuid default null,
  p_type text default 'other',
  p_title text default null,
  p_url text default null,
  p_content text default null,
  p_metadata jsonb default '{}',
  p_created_at timestamptz default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_evidence_id uuid;
begin
  v_user_id := tracker_token_user_id(p_token);
  if v_user_id is null then
    raise exception 'Invalid tracker token' using errcode = '28000';
  end if;

  if p_work_session_id is not null and not exists (
    select 1 from work_sessions s where s.id = p_work_session_id and s.user_id = v_user_id
  ) then
    raise exception 'Tracker session not found' using errcode = 'P0002';
  end if;

  if p_work_log_id is not null and not exists (
    select 1 from work_logs w where w.id = p_work_log_id and w.user_id = v_user_id
  ) then
    raise exception 'Work log not found' using errcode = 'P0002';
  end if;

  insert into evidence_items (
    user_id, work_session_id, work_log_id, type, title, url, content, metadata, created_at
  )
  values (
    v_user_id,
    p_work_session_id,
    p_work_log_id,
    p_type,
    coalesce(nullif(p_title, ''), 'Tracker evidence'),
    p_url,
    p_content,
    coalesce(p_metadata, '{}'),
    coalesce(p_created_at, now())
  )
  returning id into v_evidence_id;

  return v_evidence_id;
end;
$$;

create or replace function tracker_rpc_ai_usage_event(
  p_token text,
  p_work_session_id uuid default null,
  p_provider text default 'Other',
  p_tool text default 'Other',
  p_model_name text default null,
  p_event_type text default 'other',
  p_detected_text text default null,
  p_reset_at timestamptz default null,
  p_remaining_text text default null,
  p_source text default 'local_agent',
  p_captured_at timestamptz default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_event_id uuid;
begin
  v_user_id := tracker_token_user_id(p_token);
  if v_user_id is null then
    raise exception 'Invalid tracker token' using errcode = '28000';
  end if;

  if p_work_session_id is not null and not exists (
    select 1 from work_sessions s where s.id = p_work_session_id and s.user_id = v_user_id
  ) then
    raise exception 'Tracker session not found' using errcode = 'P0002';
  end if;

  insert into ai_usage_events (
    user_id, work_session_id, provider, tool, model_name, event_type,
    detected_text, reset_at, remaining_text, source, captured_at
  )
  values (
    v_user_id,
    p_work_session_id,
    p_provider,
    p_tool,
    p_model_name,
    p_event_type,
    p_detected_text,
    p_reset_at,
    p_remaining_text,
    p_source,
    coalesce(p_captured_at, now())
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

grant execute on function tracker_rpc_session_start(
  text, uuid, uuid, text, text, text, text, text, text, timestamptz,
  integer, integer, integer, text, text, text
) to anon, authenticated;
grant execute on function tracker_rpc_session_heartbeat(
  text, uuid, text, text, text, text, text, integer, integer, integer, text
) to anon, authenticated;
grant execute on function tracker_rpc_session_end(
  text, uuid, timestamptz, integer, integer, integer, text, text
) to anon, authenticated;
grant execute on function tracker_rpc_evidence_added(
  text, uuid, uuid, text, text, text, text, jsonb, timestamptz
) to anon, authenticated;
grant execute on function tracker_rpc_ai_usage_event(
  text, uuid, text, text, text, text, text, timestamptz, text, text, timestamptz
) to anon, authenticated;
