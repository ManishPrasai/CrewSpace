create table invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email text not null check (email = lower(email)),
  role workspace_role not null check (role in ('admin', 'member')),
  token_hash text not null unique,
  invited_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index one_pending_invite_per_email
  on invitations (workspace_id, email)
  where accepted_at is null and revoked_at is null;
create index invitations_workspace_created_idx on invitations (workspace_id, created_at);

-- Deferred from Day 2's workspaces migration: this needed the
-- invitations table to exist, since CREATE FUNCTION for a `language sql`
-- body is validated against the schema at creation time.
create function workspace_seat_count(ws uuid) returns integer
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from workspace_members where workspace_id = ws)::int
  + (select count(*) from invitations
       where workspace_id = ws and accepted_at is null
         and revoked_at is null and expires_at > now())::int;
$$;

create function check_seat_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_plan workspace_plan;
begin
  select plan into v_plan from workspaces where id = new.workspace_id;

  -- Counts rows that already exist (the row being inserted isn't counted
  -- yet at BEFORE INSERT time), so the 5th seat succeeds, the 6th fails.
  if v_plan = 'free' and workspace_seat_count(new.workspace_id) >= 5 then
    raise exception 'SEAT_LIMIT';
  end if;

  return new;
end;
$$;

create trigger check_seat_limit
  before insert on invitations
  for each row execute function check_seat_limit();

alter table invitations enable row level security;

create policy "owner or admin can view invitations" on invitations
  for select to authenticated
  using (has_workspace_role(workspace_id, array['owner', 'admin']::workspace_role[]));

create policy "owner or admin can create invitations" on invitations
  for insert to authenticated
  with check (has_workspace_role(workspace_id, array['owner', 'admin']::workspace_role[]));

create policy "owner or admin can revoke invitations" on invitations
  for update to authenticated
  using (has_workspace_role(workspace_id, array['owner', 'admin']::workspace_role[]))
  with check (has_workspace_role(workspace_id, array['owner', 'admin']::workspace_role[]));

-- No DELETE policy: invitations are revoked (revoked_at set via UPDATE),
-- never deleted.
