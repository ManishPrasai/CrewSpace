begin;
select plan(9);

select tests.create_supabase_user('invowner@example.com') as owner_id \gset
select tests.create_supabase_user('invmember@example.com') as member_id \gset
select tests.create_supabase_user('invoutsider@example.com') as outsider_id \gset

insert into workspaces (id, name, slug) values
  ('55555555-5555-5555-5555-555555555555', 'Invite Test Club', 'invite-test');

insert into workspace_members (workspace_id, user_id, role) values
  ('55555555-5555-5555-5555-555555555555', :'owner_id'::uuid, 'owner'),
  ('55555555-5555-5555-5555-555555555555', :'member_id'::uuid, 'member');

select tests.authenticate_as(:'owner_id'::uuid);

select lives_ok(
  $$ insert into invitations (workspace_id, email, role, token_hash)
     values ('55555555-5555-5555-5555-555555555555', 'a@example.com', 'member', 'hash-a') $$,
  'owner can create an invitation (seat 2 of 5)'
);

select ok(
  exists (select 1 from invitations where email = 'a@example.com'),
  'the invitation row was actually inserted'
);

reset role;
select tests.authenticate_as(:'member_id'::uuid);

select throws_ok(
  $$ insert into invitations (workspace_id, email, role, token_hash)
     values ('55555555-5555-5555-5555-555555555555', 'b@example.com', 'member', 'hash-b') $$,
  '42501',
  null,
  'a plain member cannot create invitations'
);

select is(
  (select count(*) from invitations where workspace_id = '55555555-5555-5555-5555-555555555555'),
  0::bigint,
  'member cannot even see the invitation owner created'
);

reset role;
select tests.authenticate_as(:'outsider_id'::uuid);

select is(
  (select count(*) from invitations where workspace_id = '55555555-5555-5555-5555-555555555555'),
  0::bigint,
  'an outsider sees nothing at all'
);

-- Seat limit: owner (seat 1) + 4 more invites = 5 total succeeds, the
-- 5th invite attempt (which would make 6) is rejected.
reset role;
select tests.authenticate_as(:'owner_id'::uuid);

-- 2 existing members (owner + invmember) + invite 'a' = 3 seats so far.
select lives_ok(
  $$ insert into invitations (workspace_id, email, role, token_hash)
     values ('55555555-5555-5555-5555-555555555555', 'c@example.com', 'member', 'hash-c') $$,
  'seat 4 succeeds (2 members + 2 pending invites)'
);

select lives_ok(
  $$ insert into invitations (workspace_id, email, role, token_hash)
     values ('55555555-5555-5555-5555-555555555555', 'd@example.com', 'member', 'hash-d') $$,
  'seat 5 succeeds (2 members + 3 pending invites = 5)'
);

select throws_ok(
  $$ insert into invitations (workspace_id, email, role, token_hash)
     values ('55555555-5555-5555-5555-555555555555', 'e@example.com', 'member', 'hash-e') $$,
  'SEAT_LIMIT',
  'the 6th seat is blocked on the free plan'
);

select throws_ok(
  $$ insert into invitations (workspace_id, email, role, token_hash)
     values ('55555555-5555-5555-5555-555555555555', 'f@example.com', 'member', 'hash-f') $$,
  'SEAT_LIMIT',
  'stays blocked, not just a one-off rejection of exactly the 6th call'
);

reset role;
select finish();
rollback;
