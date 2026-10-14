-- Deliberately callable by anon, unlike every other RPC in this project:
-- /invite/[token] has to show "you're invited to X as Y" BEFORE the
-- visitor logs in or signs up (docs/requirements.md). This is safe
-- because the token itself is an unguessable 64-char random hex string -
-- possessing it already is the authorization, same as a password reset
-- link. Returns zero rows for not found/revoked/accepted/expired - the
-- same "one generic outcome" shape as accept_invitation's INVITE_INVALID,
-- never revealing which reason.
create function get_invitation_preview(p_token text)
returns table (workspace_name text, role workspace_role, email text)
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_token_hash text;
  v_invite invitations%rowtype;
begin
  v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

  select * into v_invite from invitations where token_hash = v_token_hash;

  if v_invite is null
    or v_invite.revoked_at is not null
    or v_invite.accepted_at is not null
    or v_invite.expires_at <= now()
  then
    return;
  end if;

  return query
    select w.name, v_invite.role, v_invite.email
    from workspaces w
    where w.id = v_invite.workspace_id;
end;
$$;

revoke execute on function get_invitation_preview(text) from public;
grant execute on function get_invitation_preview(text) to anon, authenticated;
