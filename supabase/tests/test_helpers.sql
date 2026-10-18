begin;
select plan(4);

-- Checks effective privilege directly, so this would have caught the
-- PUBLIC-inheritance gap even though the schema/function revokes were
-- written for specific roles.
select ok(
  not has_schema_privilege('anon', 'tests', 'USAGE'),
  'anon has no USAGE on the tests schema'
);

select ok(
  not has_schema_privilege('authenticated', 'tests', 'USAGE'),
  'authenticated has no USAGE on the tests schema'
);

select ok(
  not has_function_privilege('anon', 'tests.create_supabase_user(text, jsonb)', 'EXECUTE'),
  'anon cannot execute tests.create_supabase_user'
);

select ok(
  not has_function_privilege('authenticated', 'tests.authenticate_as(uuid)', 'EXECUTE'),
  'authenticated cannot execute tests.authenticate_as'
);

select finish();
rollback;
