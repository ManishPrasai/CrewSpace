create function create_workspace(p_name text, p_slug text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_workspace_id uuid;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  insert into workspaces (name, slug)
  values (p_name, p_slug)
  returning id into v_workspace_id;

  insert into workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, auth.uid(), 'owner');

  return v_workspace_id;
end;
$$;

-- Functions grant EXECUTE to PUBLIC by default, and this Supabase project
-- also has a default-privilege rule on the public schema that separately
-- grants anon/authenticated/service_role EXECUTE on every new function
-- (confirmed via \df+ - revoking from PUBLIC alone left anon's own direct
-- grant in place). Revoke both so only authenticated can call this - the
-- auth.uid() check above is a second layer, not a substitute for this.
revoke execute on function create_workspace(text, text) from public;
revoke execute on function create_workspace(text, text) from anon;
grant execute on function create_workspace(text, text) to authenticated;
