begin;
select plan(17);

-- Fixtures inserted directly (bypasses RLS as the postgres role) - no
-- create_workspace RPC exists yet (that's a separate Day 2 task), and
-- pgTAP fixture setup normally bypasses RLS this way regardless.
select tests.create_supabase_user('owner_a@example.com') as owner_a_id \gset
select tests.create_supabase_user('member_a@example.com') as member_a_id \gset
select tests.create_supabase_user('owner_b@example.com') as owner_b_id \gset
select tests.create_supabase_user('outsider@example.com') as outsider_id \gset

insert into workspaces (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Workspace A', 'workspace-a'),
  ('22222222-2222-2222-2222-222222222222', 'Workspace B', 'workspace-b');

insert into workspace_members (workspace_id, user_id, role) values
  ('11111111-1111-1111-1111-111111111111', :'owner_a_id'::uuid, 'owner'),
  ('11111111-1111-1111-1111-111111111111', :'member_a_id'::uuid, 'member'),
  ('22222222-2222-2222-2222-222222222222', :'owner_b_id'::uuid, 'owner');

select tests.authenticate_as(:'owner_a_id'::uuid);

-- Cross-tenant isolation.
select is(
  (select count(*) from workspaces where id = '11111111-1111-1111-1111-111111111111'),
  1::bigint,
  'member can select their own workspace'
);

select is(
  (select count(*) from workspaces where id = '22222222-2222-2222-2222-222222222222'),
  0::bigint,
  'member cannot select a workspace they do not belong to'
);

select is(
  (select count(*) from workspace_members where workspace_id = '22222222-2222-2222-2222-222222222222'),
  0::bigint,
  'member cannot select another workspace''s membership rows'
);

-- Column-level grants: name is allowed, plan/stripe columns are not.
select lives_ok(
  format('update workspaces set name = %L where id = %L', 'Workspace A Renamed', '11111111-1111-1111-1111-111111111111'),
  'owner can rename their own workspace'
);

select throws_ok(
  format('update workspaces set plan = %L where id = %L', 'pro', '11111111-1111-1111-1111-111111111111'),
  '42501',
  null,
  'owner cannot update plan from the client'
);

select throws_ok(
  format('update workspaces set stripe_customer_id = %L where id = %L', 'cus_fake', '11111111-1111-1111-1111-111111111111'),
  '42501',
  null,
  'owner cannot update stripe_customer_id from the client'
);

-- Row-level: member (not owner/admin) cannot rename.
reset role;
select tests.authenticate_as(:'member_a_id'::uuid);

update workspaces set name = 'Hijacked' where id = '11111111-1111-1111-1111-111111111111';

select isnt(
  (select name from workspaces where id = '11111111-1111-1111-1111-111111111111'),
  'Hijacked',
  'plain member cannot rename the workspace (RLS silently filters the row, not a grant error)'
);

-- profiles co-member policy (deferred from Day 1, added this migration).
select ok(
  exists (select 1 from public.profiles where id = :'owner_a_id'::uuid),
  'member can select the profile of a workspace-mate'
);

select is(
  (select count(*) from public.profiles where id = :'outsider_id'::uuid),
  0::bigint,
  'member cannot select the profile of an unrelated user'
);

reset role;
select tests.authenticate_as(:'outsider_id'::uuid);

select is(
  (select count(*) from public.profiles where id = :'owner_a_id'::uuid),
  0::bigint,
  'unrelated user cannot select owner_a''s profile either'
);

select is(
  (select count(*) from workspaces),
  0::bigint,
  'user in no workspace sees no workspaces at all'
);

-- Day 7: deletion is owner-only AND blocked while plan='pro' (docs: a
-- workspace can't be deleted while its subscription is active).
reset role;

insert into workspaces (id, name, slug, plan) values
  ('33333333-3333-3333-3333-333333333333', 'Workspace C Pro', 'workspace-c-pro', 'pro');
insert into workspace_members (workspace_id, user_id, role) values
  ('33333333-3333-3333-3333-333333333333', :'owner_b_id'::uuid, 'owner');

select tests.authenticate_as(:'member_a_id'::uuid);

select lives_ok(
  $$ delete from workspaces where id = '11111111-1111-1111-1111-111111111111' $$,
  'a plain member can run a delete, but RLS hides the row from it'
);

reset role;
select is(
  (select count(*) from workspaces where id = '11111111-1111-1111-1111-111111111111'),
  1::bigint,
  'the member could not actually delete the workspace'
);

select tests.authenticate_as(:'owner_b_id'::uuid);

select lives_ok(
  $$ delete from workspaces where id = '33333333-3333-3333-3333-333333333333' $$,
  'even the owner can run a delete on their pro-plan workspace, but RLS hides it'
);

reset role;
select is(
  (select count(*) from workspaces where id = '33333333-3333-3333-3333-333333333333'),
  1::bigint,
  'a workspace on the pro plan was not deleted, subscription still active'
);

select tests.authenticate_as(:'owner_a_id'::uuid);

select lives_ok(
  $$ delete from workspaces where id = '11111111-1111-1111-1111-111111111111' $$,
  'the owner of a free-plan workspace can delete it'
);

reset role;
select is(
  (select count(*) from workspaces where id = '11111111-1111-1111-1111-111111111111'),
  0::bigint,
  'the free-plan workspace is actually gone'
);

reset role;
select finish();
rollback;
