-- search_path includes extensions: pgcrypto's digest() lives there on
-- this Supabase project (confirmed via config.toml's extra_search_path
-- and the pg_extension catalog), not in public.
create function accept_invitation(p_token text) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_token_hash text;
  v_invite invitations%rowtype;
  v_caller_email text;
  v_plan workspace_plan;
  v_member_count integer;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

  select * into v_invite from invitations where token_hash = v_token_hash;

  -- Not found, revoked, accepted, or expired: one generic code, same as
  -- an auth failure never reveals which part was wrong.
  if v_invite is null
    or v_invite.revoked_at is not null
    or v_invite.accepted_at is not null
    or v_invite.expires_at <= now()
  then
    raise exception 'INVITE_INVALID';
  end if;

  select email into v_caller_email from auth.users where id = auth.uid();

  if v_caller_email is null or lower(v_caller_email) != v_invite.email then
    raise exception 'INVITE_INVALID';
  end if;

  -- Lock the workspace row: without this, two concurrent accepts on a
  -- free workspace sitting at 4 members could both read "4 < 5" and both
  -- insert, landing at 6.
  select plan into v_plan from workspaces where id = v_invite.workspace_id for update;

  if exists (
    select 1 from workspace_members
    where workspace_id = v_invite.workspace_id and user_id = auth.uid()
  ) then
    update invitations set accepted_at = now() where id = v_invite.id;
    return v_invite.workspace_id;
  end if;

  -- The pending invite being accepted already reserved its own seat (see
  -- workspace_seat_count), so only count actual members here.
  if v_plan = 'free' then
    select count(*) into v_member_count
    from workspace_members where workspace_id = v_invite.workspace_id;

    if v_member_count >= 5 then
      raise exception 'SEAT_LIMIT';
    end if;
  end if;

  insert into workspace_members (workspace_id, user_id, role)
  values (v_invite.workspace_id, auth.uid(), v_invite.role);

  update invitations set accepted_at = now() where id = v_invite.id;

  return v_invite.workspace_id;
end;
$$;

revoke execute on function accept_invitation(text) from public;
revoke execute on function accept_invitation(text) from anon;
grant execute on function accept_invitation(text) to authenticated;
