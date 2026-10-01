create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 100),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "self select profile" on profiles
  for select to authenticated
  using (id = auth.uid());

create policy "self update profile" on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Column-level grants: even though the policy above allows an update,
-- an authenticated user may only ever change their own full_name and
-- avatar_url, never id or created_at.
revoke update on profiles from authenticated;
grant update (full_name, avatar_url) on profiles to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
begin
  -- Sanitise signup metadata so a malformed or oversized full_name can
  -- never fail the auth.users insert: trim, cut to 100 chars, null if empty.
  v_full_name := nullif(left(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), 100), '');

  insert into public.profiles (id, full_name)
  values (new.id, v_full_name);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
