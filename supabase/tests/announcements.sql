begin;
select plan(14);

select tests.create_supabase_user('annowner@example.com') as owner_id \gset
select tests.create_supabase_user('annadmin@example.com') as admin_id \gset
select tests.create_supabase_user('annmember@example.com') as member_id \gset
select tests.create_supabase_user('annoutsider@example.com') as outsider_id \gset

insert into workspaces (id, name, slug) values
  ('66666666-6666-6666-6666-666666666666', 'Announce Test Club', 'announce-test'),
  ('77777777-7777-7777-7777-777777777777', 'Other Workspace', 'announce-other');

insert into workspace_members (workspace_id, user_id, role) values
  ('66666666-6666-6666-6666-666666666666', :'owner_id'::uuid, 'owner'),
  ('66666666-6666-6666-6666-666666666666', :'admin_id'::uuid, 'admin'),
  ('66666666-6666-6666-6666-666666666666', :'member_id'::uuid, 'member'),
  ('77777777-7777-7777-7777-777777777777', :'outsider_id'::uuid, 'owner');

select tests.authenticate_as(:'owner_id'::uuid);

select lives_ok(
  format(
    $$ insert into announcements (workspace_id, author_id, title, body)
       values ('66666666-6666-6666-6666-666666666666', %L, 'First post', 'Hello workspace') $$,
    :'owner_id'
  ),
  'owner can create an announcement'
);

select throws_ok(
  format(
    $$ insert into announcements (workspace_id, author_id, title, body)
       values ('66666666-6666-6666-6666-666666666666', %L, 'Spoofed author', 'x') $$,
    :'member_id'
  ),
  '42501',
  null,
  'owner cannot create an announcement with another user as author_id'
);

reset role;
select tests.authenticate_as(:'admin_id'::uuid);

select lives_ok(
  format(
    $$ insert into announcements (workspace_id, author_id, title, body)
       values ('66666666-6666-6666-6666-666666666666', %L, 'Second post', 'From admin') $$,
    :'admin_id'
  ),
  'admin can create an announcement'
);

reset role;
select tests.authenticate_as(:'member_id'::uuid);

select throws_ok(
  format(
    $$ insert into announcements (workspace_id, author_id, title, body)
       values ('66666666-6666-6666-6666-666666666666', %L, 'Not allowed', 'x') $$,
    :'member_id'
  ),
  '42501',
  null,
  'a plain member cannot create an announcement'
);

select is(
  (select count(*) from announcements where workspace_id = '66666666-6666-6666-6666-666666666666'),
  2::bigint,
  'member can read both announcements the owner and admin created'
);

-- RLS's USING clause filters the rows out of the member's view before the
-- UPDATE/DELETE ever runs, so there's no permission-denied exception the
-- way INSERT's WITH CHECK produces one - it's a silent 0-row match. Same
-- security property (member can't touch it), different Postgres mechanic.
select lives_ok(
  $$ update announcements set title = 'hacked'
     where workspace_id = '66666666-6666-6666-6666-666666666666' $$,
  'a plain member can run an update, but RLS hides every row from it'
);

select is(
  (select count(*) from announcements where title = 'hacked'),
  0::bigint,
  'the member could not actually change any announcement title'
);

select lives_ok(
  $$ delete from announcements where workspace_id = '66666666-6666-6666-6666-666666666666' $$,
  'a plain member can run a delete, but RLS hides every row from it'
);

select is(
  (select count(*) from announcements where workspace_id = '66666666-6666-6666-6666-666666666666'),
  2::bigint,
  'the member could not actually delete any announcement'
);

reset role;
select tests.authenticate_as(:'outsider_id'::uuid);

select is(
  (select count(*) from announcements where workspace_id = '66666666-6666-6666-6666-666666666666'),
  0::bigint,
  'an outsider in a different workspace sees nothing'
);

reset role;
select tests.authenticate_as(:'owner_id'::uuid);

-- now() is frozen for the whole wrapping transaction, so comparing
-- updated_at > created_at after a same-transaction update would never
-- pass. Instead, force updated_at backward first (as postgres, bypassing
-- RLS) and confirm the trigger overwrites whatever the client - or in
-- this case the test itself - tried to set.
reset role;
update announcements set updated_at = '2000-01-01'
  where workspace_id = '66666666-6666-6666-6666-666666666666' and title = 'First post';
select tests.authenticate_as(:'owner_id'::uuid);

select lives_ok(
  $$ update announcements set title = 'First post, edited'
     where workspace_id = '66666666-6666-6666-6666-666666666666' and title = 'First post' $$,
  'owner can update an announcement'
);

select isnt(
  (select updated_at from announcements
   where workspace_id = '66666666-6666-6666-6666-666666666666' and title = 'First post, edited')::text,
  '2000-01-01'::timestamptz::text,
  'the set_updated_at trigger overwrites updated_at on every update'
);

select lives_ok(
  $$ delete from announcements where workspace_id = '66666666-6666-6666-6666-666666666666'
     and title = 'Second post' $$,
  'owner can delete an announcement created by someone else (admin)'
);

select is(
  (select count(*) from announcements where workspace_id = '66666666-6666-6666-6666-666666666666'),
  1::bigint,
  'the delete actually removed the row'
);

reset role;
select finish();
rollback;
