-- Backs createInvitation's "CONFLICT if already a member" check
-- (docs/api.md). auth.users isn't queryable from the client at all, and
-- the admin API's listUsers() has no email filter (would mean paging
-- through every user), so this is a small security definer helper
-- instead - same pattern as accept_invitation's own email matching.
-- Gated to owner/admin: without that, any authenticated user could probe
-- which emails belong to an arbitrary workspace's membership.
create function is_email_workspace_member(p_ws uuid, p_email text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not has_workspace_role(p_ws, array['owner', 'admin']::workspace_role[]) then
    raise exception 'FORBIDDEN';
  end if;

  return exists (
    select 1 from workspace_members wm
    join auth.users u on u.id = wm.user_id
    where wm.workspace_id = p_ws and lower(u.email) = lower(p_email)
  );
end;
$$;

revoke execute on function is_email_workspace_member(uuid, text) from public;
revoke execute on function is_email_workspace_member(uuid, text) from anon;
grant execute on function is_email_workspace_member(uuid, text) to authenticated;
