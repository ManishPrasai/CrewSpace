begin;
select plan(2);

-- Simulates a workspace that was Pro (unlimited members) and got
-- downgraded to Free after a cancelled subscription, landing with more
-- members than the free plan allows. check_seat_limit() re-reads the
-- workspace's current plan and current seat count on every invitation
-- insert - it isn't a one-time check done only when the 5th seat is
-- added - so the existing trigger from Day 4 already covers this
-- without any new code. This test exists to prove that, not to add
-- new behavior.

select tests.create_supabase_user('downgradeowner@example.com') as owner_id \gset
select tests.create_supabase_user('downgrademember1@example.com') as m1_id \gset
select tests.create_supabase_user('downgrademember2@example.com') as m2_id \gset
select tests.create_supabase_user('downgrademember3@example.com') as m3_id \gset
select tests.create_supabase_user('downgrademember4@example.com') as m4_id \gset
select tests.create_supabase_user('downgrademember5@example.com') as m5_id \gset

-- Created as 'free' directly: the point is a workspace already AT the
-- limit before any invite in this test runs, standing in for "was pro
-- with 6 members, subscription lapsed, now free".
insert into workspaces (id, name, slug, plan) values
  ('88888888-8888-8888-8888-888888888888', 'Downgraded Club', 'downgrade-test', 'free');

-- Direct member inserts aren't gated by check_seat_limit (it only fires
-- on invitations insert, not workspace_members insert) - this is how
-- every seat-limit fixture in this test suite simulates "already has
-- N members" without needing N real invite-and-accept round trips.
insert into workspace_members (workspace_id, user_id, role) values
  ('88888888-8888-8888-8888-888888888888', :'owner_id'::uuid, 'owner'),
  ('88888888-8888-8888-8888-888888888888', :'m1_id'::uuid, 'member'),
  ('88888888-8888-8888-8888-888888888888', :'m2_id'::uuid, 'member'),
  ('88888888-8888-8888-8888-888888888888', :'m3_id'::uuid, 'member'),
  ('88888888-8888-8888-8888-888888888888', :'m4_id'::uuid, 'member'),
  ('88888888-8888-8888-8888-888888888888', :'m5_id'::uuid, 'member');

select tests.authenticate_as(:'owner_id'::uuid);

select throws_ok(
  $$ insert into invitations (workspace_id, email, role, token_hash)
     values ('88888888-8888-8888-8888-888888888888', 'new@example.com', 'member', 'hash-downgrade') $$,
  'SEAT_LIMIT',
  'a workspace already over the free limit (via existing members, not pending invites) blocks a brand new invite'
);

select is(
  (select count(*) from invitations where workspace_id = '88888888-8888-8888-8888-888888888888'),
  0::bigint,
  'the blocked invite was not actually inserted'
);

reset role;
select finish();
rollback;
