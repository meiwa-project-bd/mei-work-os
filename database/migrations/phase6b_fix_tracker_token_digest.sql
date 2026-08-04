-- Phase 6B repair - make tracker token hashing portable in Supabase/Postgres.
-- Run this if /api/tracker/events returns:
-- "function digest(text, unknown) does not exist"
-- or "function digest(bytea, unknown) does not exist"

create extension if not exists "pgcrypto";

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
