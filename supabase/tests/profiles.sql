begin;
select plan(10);

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

-- ADR-026: OAuth providers (Google/Microsoft) populate "name"/"picture"
-- in raw_user_meta_data, not "full_name"/"avatar_url" - the trigger
-- must fall back to those keys too.
select tests.create_supabase_user(
  'oauth@example.com',
  '{"name": "OAuth Person", "picture": "https://example.com/avatar.jpg"}'::jsonb
) as oauth_id \gset

select is(
  (select full_name from public.profiles where id = :'oauth_id'::uuid),
  'OAuth Person',
  'trigger falls back to raw_user_meta_data.name when full_name is absent'
);

select is(
  (select avatar_url from public.profiles where id = :'oauth_id'::uuid),
  'https://example.com/avatar.jpg',
  'trigger populates avatar_url from raw_user_meta_data.picture'
);

-- A non-https avatar URL must be dropped, not fail the signup insert
-- (matches the column's own check constraint).
select tests.create_supabase_user(
  'badavatar@example.com',
  '{"name": "Bad Avatar", "picture": "http://insecure.example.com/x.jpg"}'::jsonb
) as bad_avatar_id \gset

select is(
  (select avatar_url from public.profiles where id = :'bad_avatar_id'::uuid),
  null,
  'trigger nulls out a non-https avatar_url instead of failing the insert'
);

select finish();
rollback;
