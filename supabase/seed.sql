-- pgTAP test helpers. Local/CI only: `seed.sql` runs on `supabase db reset`
-- and is never applied in production (`supabase db push` only includes it
-- with the explicit --include-seed flag, which this project's deploy flow
-- does not use).
create schema if not exists tests;

create function tests.create_supabase_user(p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, role, aud, raw_user_meta_data)
  values (v_user_id, p_email, 'authenticated', 'authenticated', '{}'::jsonb);

  return v_user_id;
end;
$$;

-- Not security definer: SET ROLE is disallowed inside a security-definer
-- function body (it would let the function escalate its own privilege
-- context), and neither of these needs elevated privileges anyway.
create function tests.authenticate_as(p_user_id uuid)
returns void
language plpgsql
set search_path = public
as $$
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user_id, 'role', 'authenticated')::text,
    true
  );
  set local role authenticated;
end;
$$;

-- These simulate auth for pgTAP only. Never let real client roles call them.
revoke execute on function tests.create_supabase_user(text) from anon, authenticated;
revoke execute on function tests.authenticate_as(uuid) from anon, authenticated;
