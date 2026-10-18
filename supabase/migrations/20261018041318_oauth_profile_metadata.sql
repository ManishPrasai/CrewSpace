-- ADR-026: Google/Microsoft OAuth populate raw_user_meta_data's "name"
-- and "picture"/"avatar_url" keys (varies per provider), not
-- "full_name" the way email signup's own signUp() call does
-- (src/features/auth/actions.ts). Without this, an OAuth sign-in would
-- leave profiles.full_name null even though the provider did supply a
-- name. avatar_url was never populated by any path before this -
-- same sanitisation approach as full_name: coalesce the possible
-- source keys, and null out anything that fails the column's own
-- check constraint (avatar_url ~ '^https://') instead of letting the
-- insert fail outright.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_avatar_url text;
begin
  v_full_name := nullif(
    left(trim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')), 100),
    ''
  );

  v_avatar_url := coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture');
  if v_avatar_url is not null and v_avatar_url !~ '^https://' then
    v_avatar_url := null;
  end if;

  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, v_full_name, v_avatar_url);

  return new;
end;
$$;
