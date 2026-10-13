begin;
select plan(10);

select tests.create_supabase_user('acceptowner@example.com') as owner_id \gset
select tests.create_supabase_user('invitee@example.com') as invitee_id \gset
select tests.create_supabase_user('wrongperson@example.com') as wrong_id \gset
select tests.create_supabase_user('alreadymember@example.com') as already_id \gset

insert into workspaces (id, name, slug) values
  ('66666666-6666-6666-6666-666666666666', 'Accept Test Club', 'accept-test');

insert into workspace_members (workspace_id, user_id, role) values
  ('66666666-6666-6666-6666-666666666666', :'owner_id'::uuid, 'owner'),
  ('66666666-6666-6666-6666-666666666666', :'already_id'::uuid, 'member');

-- Happy path.
insert into invitations (workspace_id, email, role, token_hash) values (
  '66666666-6666-6666-6666-666666666666', 'invitee@example.com', 'member',
  encode(digest('token-happy-path', 'sha256'), 'hex')
);

select tests.authenticate_as(:'invitee_id'::uuid);

select ok(
  accept_invitation('token-happy-path') = '66666666-6666-6666-6666-666666666666'::uuid,
  'valid invite, matching email: accepts and returns the workspace id'
);

select ok(
  exists (
    select 1 from workspace_members
    where workspace_id = '66666666-6666-6666-6666-666666666666' and user_id = :'invitee_id'::uuid and role = 'member'
  ),
  'membership was actually inserted with the invited role'
);

-- invitations' SELECT policy is owner/admin only - invitee (a plain
-- member) can't read it back themselves, so check as postgres (RLS
-- doesn't apply to a superuser) rather than leave the session as invitee.
reset role;

select ok(
  (select accepted_at is not null from invitations where token_hash = encode(digest('token-happy-path', 'sha256'), 'hex')),
  'the invitation is marked accepted'
);

select tests.authenticate_as(:'invitee_id'::uuid);

select throws_ok(
  $$ select accept_invitation('token-happy-path') $$,
  'INVITE_INVALID',
  'a reused (already-accepted) token is rejected'
);

-- Wrong email.
reset role;
insert into invitations (workspace_id, email, role, token_hash) values (
  '66666666-6666-6666-6666-666666666666', 'invitee@example.com', 'member',
  encode(digest('token-wrong-email', 'sha256'), 'hex')
);

select tests.authenticate_as(:'wrong_id'::uuid);

select throws_ok(
  $$ select accept_invitation('token-wrong-email') $$,
  'INVITE_INVALID',
  'logged-in user whose email does not match the invite is rejected'
);

-- Expired. Revoke the still-pending "wrong email" invite first - per
-- docs/database.md, a pending invite blocks a new one for the same
-- email regardless of why it's stuck pending (matches real behavior,
-- not a workaround).
reset role;
update invitations set revoked_at = now()
where token_hash = encode(digest('token-wrong-email', 'sha256'), 'hex');

insert into invitations (workspace_id, email, role, token_hash, expires_at) values (
  '66666666-6666-6666-6666-666666666666', 'invitee@example.com', 'member',
  encode(digest('token-expired', 'sha256'), 'hex'), now() - interval '1 hour'
);

select tests.authenticate_as(:'invitee_id'::uuid);

select throws_ok(
  $$ select accept_invitation('token-expired') $$,
  'INVITE_INVALID',
  'an expired invite is rejected'
);

-- Revoked.
reset role;
insert into invitations (workspace_id, email, role, token_hash, revoked_at) values (
  '66666666-6666-6666-6666-666666666666', 'invitee@example.com', 'member',
  encode(digest('token-revoked', 'sha256'), 'hex'), now()
);

select tests.authenticate_as(:'invitee_id'::uuid);

select throws_ok(
  $$ select accept_invitation('token-revoked') $$,
  'INVITE_INVALID',
  'a revoked invite is rejected'
);

-- Already a member: marks accepted, does not insert a duplicate row, no error.
reset role;
insert into invitations (workspace_id, email, role, token_hash) values (
  '66666666-6666-6666-6666-666666666666', 'alreadymember@example.com', 'admin',
  encode(digest('token-already-member', 'sha256'), 'hex')
);

select tests.authenticate_as(:'already_id'::uuid);

select lives_ok(
  $$ select accept_invitation('token-already-member') $$,
  'accepting while already a member succeeds (no-op membership-wise)'
);

select is(
  (select count(*) from workspace_members where workspace_id = '66666666-6666-6666-6666-666666666666' and user_id = :'already_id'::uuid),
  1::bigint,
  'still exactly one membership row - role was not changed by the stale invite either'
);

-- Seat limit: accept_invitation counts actual members only (the pending
-- invite being accepted already reserved its own seat), unlike the
-- insert-time trigger which counts members + pending invites together.
-- Create the invitation FIRST, while still under capacity - the
-- check_seat_limit trigger also fires on invitation creation, so
-- creating it after the workspace is already over the limit would be
-- rejected right there, before ever reaching accept_invitation.
reset role;
select tests.create_supabase_user('seat3@example.com') as seat3_id \gset
select tests.create_supabase_user('seat4@example.com') as seat4_id \gset
select tests.create_supabase_user('seat5@example.com') as seat5_id \gset
select tests.create_supabase_user('seat6@example.com') as seat6_id \gset

insert into invitations (workspace_id, email, role, token_hash) values (
  '66666666-6666-6666-6666-666666666666', 'seat6@example.com', 'member',
  encode(digest('token-seat6', 'sha256'), 'hex')
);

-- Direct member inserts aren't gated by check_seat_limit (only invitation
-- creation is), so this can freely push the workspace over the limit.
insert into workspace_members (workspace_id, user_id, role) values
  ('66666666-6666-6666-6666-666666666666', :'seat3_id'::uuid, 'member'),
  ('66666666-6666-6666-6666-666666666666', :'seat4_id'::uuid, 'member'),
  ('66666666-6666-6666-6666-666666666666', :'seat5_id'::uuid, 'member');
-- members now: owner, already_id, invitee_id, seat3, seat4, seat5 = 6

select tests.authenticate_as(:'seat6_id'::uuid);

select throws_ok(
  $$ select accept_invitation('token-seat6') $$,
  'SEAT_LIMIT',
  'accept_invitation enforces the seat limit at accept time too, not just at invite-creation time'
);

reset role;
select finish();
rollback;
