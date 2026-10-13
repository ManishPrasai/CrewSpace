begin;
select plan(14);

select tests.create_supabase_user('owner@example.com') as owner_id \gset
select tests.create_supabase_user('admin@example.com') as admin_id \gset
select tests.create_supabase_user('member1@example.com') as member1_id \gset
select tests.create_supabase_user('member2@example.com') as member2_id \gset

insert into workspaces (id, name, slug) values
  ('33333333-3333-3333-3333-333333333333', 'Test Club', 'test-club');

insert into workspace_members (workspace_id, user_id, role) values
  ('33333333-3333-3333-3333-333333333333', :'owner_id'::uuid, 'owner'),
  ('33333333-3333-3333-3333-333333333333', :'admin_id'::uuid, 'admin'),
  ('33333333-3333-3333-3333-333333333333', :'member1_id'::uuid, 'member'),
  ('33333333-3333-3333-3333-333333333333', :'member2_id'::uuid, 'member');

-- change_member_role
select tests.authenticate_as(:'owner_id'::uuid);

select lives_ok(
  format('select change_member_role(%L, %L, %L)', '33333333-3333-3333-3333-333333333333', :'member1_id', 'admin'),
  'owner can promote a member to admin'
);

select is(
  (select role from workspace_members where workspace_id = '33333333-3333-3333-3333-333333333333' and user_id = :'member1_id'::uuid),
  'admin'::workspace_role,
  'the role actually changed'
);

select throws_ok(
  format('select change_member_role(%L, %L, %L)', '33333333-3333-3333-3333-333333333333', :'member2_id', 'owner'),
  'FORBIDDEN',
  'cannot set a role to owner (ownership transfer out of scope)'
);

select throws_ok(
  format('select change_member_role(%L, %L, %L)', '33333333-3333-3333-3333-333333333333', :'owner_id', 'admin'),
  'FORBIDDEN',
  'owner cannot change their own role'
);

reset role;
select tests.authenticate_as(:'admin_id'::uuid);

select throws_ok(
  format('select change_member_role(%L, %L, %L)', '33333333-3333-3333-3333-333333333333', :'member2_id', 'admin'),
  'FORBIDDEN',
  'a plain member (not owner) cannot change roles - admin is not owner either'
);

reset role;
select tests.authenticate_as(:'member2_id'::uuid);

select throws_ok(
  format('select change_member_role(%L, %L, %L)', '33333333-3333-3333-3333-333333333333', :'member2_id', 'admin'),
  'FORBIDDEN',
  'a plain member cannot change roles at all, including their own'
);

-- remove_member
reset role;
select tests.authenticate_as(:'owner_id'::uuid);

select throws_ok(
  format('select remove_member(%L, %L)', '33333333-3333-3333-3333-333333333333', :'owner_id'),
  'FORBIDDEN',
  'nobody can remove the owner, including the owner themself'
);

select lives_ok(
  format('select remove_member(%L, %L)', '33333333-3333-3333-3333-333333333333', :'member2_id'),
  'owner can remove a plain member'
);

select is(
  (select count(*) from workspace_members where workspace_id = '33333333-3333-3333-3333-333333333333' and user_id = :'member2_id'::uuid),
  0::bigint,
  'the removed member is actually gone'
);

reset role;
select tests.authenticate_as(:'admin_id'::uuid);

select throws_ok(
  format('select remove_member(%L, %L)', '33333333-3333-3333-3333-333333333333', :'owner_id'),
  'FORBIDDEN',
  'admin cannot remove the owner'
);

-- member1 is an admin now (promoted above) - admin cannot remove admin
select throws_ok(
  format('select remove_member(%L, %L)', '33333333-3333-3333-3333-333333333333', :'member1_id'),
  'FORBIDDEN',
  'admin cannot remove another admin'
);

-- leave_workspace
reset role;
select tests.authenticate_as(:'owner_id'::uuid);

select throws_ok(
  format('select leave_workspace(%L)', '33333333-3333-3333-3333-333333333333'),
  'FORBIDDEN',
  'owner cannot leave their own workspace'
);

reset role;
select tests.authenticate_as(:'member1_id'::uuid);

select lives_ok(
  format('select leave_workspace(%L)', '33333333-3333-3333-3333-333333333333'),
  'a non-owner member can leave on their own'
);

select is(
  (select count(*) from workspace_members where workspace_id = '33333333-3333-3333-3333-333333333333' and user_id = :'member1_id'::uuid),
  0::bigint,
  'they are actually gone after leaving'
);

reset role;
select finish();
rollback;
