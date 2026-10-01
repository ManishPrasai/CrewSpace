begin;
select plan(7);

select tests.create_supabase_user('owner@example.com') as owner_id \gset
select tests.create_supabase_user('other@example.com') as other_id \gset

-- Trigger: inserting into auth.users creates a matching profiles row.
select ok(
  exists (select 1 from public.profiles where id = :'owner_id'::uuid),
  'trigger creates a profile row on signup'
);

select is(
  (select full_name from public.profiles where id = :'owner_id'::uuid),
  null,
  'profile has no full_name when signup metadata had none'
);

select tests.authenticate_as(:'owner_id'::uuid);

-- Self select/update.
select ok(
  exists (select 1 from public.profiles where id = :'owner_id'::uuid),
  'owner can select their own profile'
);

select lives_ok(
  format('update public.profiles set full_name = %L where id = %L', 'Owner Name', :'owner_id'),
  'owner can update their own full_name'
);

select throws_ok(
  format('update public.profiles set id = %L where id = %L', gen_random_uuid(), :'owner_id'),
  '42501',
  null,
  'owner cannot update their own id column'
);

select throws_ok(
  format('update public.profiles set created_at = now() where id = %L', :'owner_id'),
  '42501',
  null,
  'owner cannot update their own created_at column'
);

-- Cross-user isolation.
select is(
  (select count(*) from public.profiles where id = :'other_id'::uuid),
  0::bigint,
  'owner cannot select another user''s profile'
);

reset role;
select finish();
rollback;
