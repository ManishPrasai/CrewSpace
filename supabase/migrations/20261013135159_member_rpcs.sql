create function change_member_role(p_ws uuid, p_user uuid, p_role workspace_role)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  if not has_workspace_role(p_ws, array['owner']::workspace_role[]) then
    raise exception 'FORBIDDEN';
  end if;

  -- Ownership transfer is out of scope.
  if p_role = 'owner' then
    raise exception 'FORBIDDEN';
  end if;

  -- Caller is owner and there's only ever one owner, so if the target is
  -- currently the owner, the target is the caller - cannot change own role.
  if exists (
    select 1 from workspace_members
    where workspace_id = p_ws and user_id = p_user and role = 'owner'
  ) then
    raise exception 'FORBIDDEN';
  end if;

  update workspace_members set role = p_role
  where workspace_id = p_ws and user_id = p_user;

  if not found then
    raise exception 'NOT_FOUND';
  end if;
end;
$$;

create function remove_member(p_ws uuid, p_user uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_target_role workspace_role;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  select role into v_target_role from workspace_members
  where workspace_id = p_ws and user_id = p_user;

  if v_target_role is null then
    raise exception 'NOT_FOUND';
  end if;

  if v_target_role = 'owner' then
    raise exception 'FORBIDDEN';
  end if;

  if has_workspace_role(p_ws, array['owner']::workspace_role[]) then
    -- owner can remove admins and members, already confirmed not owner above
    null;
  elsif has_workspace_role(p_ws, array['admin']::workspace_role[])
    and v_target_role = 'member' then
    -- admin can remove members only
    null;
  else
    raise exception 'FORBIDDEN';
  end if;

  delete from workspace_members where workspace_id = p_ws and user_id = p_user;
end;
$$;

create function leave_workspace(p_ws uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_role workspace_role;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  select role into v_role from workspace_members
  where workspace_id = p_ws and user_id = auth.uid();

  if v_role is null then
    raise exception 'NOT_FOUND';
  end if;

  if v_role = 'owner' then
    raise exception 'FORBIDDEN';
  end if;

  delete from workspace_members where workspace_id = p_ws and user_id = auth.uid();
end;
$$;

-- See create_workspace's migration: this Supabase project grants anon its
-- own direct EXECUTE on every new public-schema function by default
-- (separate from the generic PUBLIC grant) - revoke both explicitly.
revoke execute on function change_member_role(uuid, uuid, workspace_role) from public;
revoke execute on function change_member_role(uuid, uuid, workspace_role) from anon;
grant execute on function change_member_role(uuid, uuid, workspace_role) to authenticated;

revoke execute on function remove_member(uuid, uuid) from public;
revoke execute on function remove_member(uuid, uuid) from anon;
grant execute on function remove_member(uuid, uuid) to authenticated;

revoke execute on function leave_workspace(uuid) from public;
revoke execute on function leave_workspace(uuid) from anon;
grant execute on function leave_workspace(uuid) to authenticated;
