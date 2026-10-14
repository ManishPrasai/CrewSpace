begin;
select plan(5);

select tests.create_supabase_user('previewowner@example.com') as owner_id \gset

insert into workspaces (id, name, slug) values
  ('99999999-9999-9999-9999-999999999999', 'Preview Test Club', 'preview-test');
insert into workspace_members (workspace_id, user_id, role) values
  ('99999999-9999-9999-9999-999999999999', :'owner_id'::uuid, 'owner');

insert into invitations (workspace_id, email, role, token_hash) values (
  '99999999-9999-9999-9999-999999999999', 'previewee@example.com', 'admin',
  encode(digest('preview-token', 'sha256'), 'hex')
);
insert into invitations (workspace_id, email, role, token_hash, expires_at) values (
  '99999999-9999-9999-9999-999999999999', 'expired@example.com', 'member',
  encode(digest('preview-token-expired', 'sha256'), 'hex'), now() - interval '1 hour'
);
insert into invitations (workspace_id, email, role, token_hash, revoked_at) values (
  '99999999-9999-9999-9999-999999999999', 'revoked@example.com', 'member',
  encode(digest('preview-token-revoked', 'sha256'), 'hex'), now()
);

-- anon (no auth at all) can preview a valid invite - this is the whole
-- point of the RPC, so prove it works with zero authentication, not just
-- as a logged-in user.
select is(
  (select count(*) from get_invitation_preview('preview-token')),
  1::bigint,
  'anon can preview a valid, pending invite'
);

select is(
  (select workspace_name from get_invitation_preview('preview-token')),
  'Preview Test Club',
  'preview returns the correct workspace name'
);

select is(
  (select role from get_invitation_preview('preview-token')),
  'admin'::workspace_role,
  'preview returns the correct role'
);

select is(
  (select count(*) from get_invitation_preview('preview-token-expired')),
  0::bigint,
  'expired invite previews as not found (no rows), not an error'
);

select is(
  (select count(*) from get_invitation_preview('preview-token-revoked')),
  0::bigint,
  'revoked invite previews as not found too'
);

select finish();
rollback;
