begin;
select plan(6);

select tests.create_supabase_user('creator@example.com') as creator_id \gset

-- Not authenticated: should fail before touching either table.
select throws_ok(
  $$ select create_workspace('No Session FC', 'no-session-fc') $$,
  'UNAUTHENTICATED',
  'create_workspace rejects an unauthenticated caller'
);

select tests.authenticate_as(:'creator_id'::uuid);

select lives_ok(
  format('select create_workspace(%L, %L)', 'Bhadrapur FC', 'bhadrapur-fc'),
  'authenticated user can create a workspace'
);

select ok(
  exists (select 1 from workspaces where slug = 'bhadrapur-fc'),
  'the workspace row was actually inserted'
);

select is(
  (
    select role from workspace_members wm
    join workspaces w on w.id = wm.workspace_id
    where w.slug = 'bhadrapur-fc' and wm.user_id = :'creator_id'::uuid
  ),
  'owner'::workspace_role,
  'the creator is inserted as owner, in the same call'
);

select throws_ok(
  format('select create_workspace(%L, %L)', 'Duplicate Slug FC', 'bhadrapur-fc'),
  '23505',
  null,
  'a duplicate slug is rejected (unique constraint, mapped to CONFLICT at the app layer)'
);

reset role;

select is(
  (select count(*) from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'create_workspace'
       and has_function_privilege('anon', p.oid, 'EXECUTE')
  ),
  0::bigint,
  'anon cannot execute create_workspace'
);

select finish();
rollback;
