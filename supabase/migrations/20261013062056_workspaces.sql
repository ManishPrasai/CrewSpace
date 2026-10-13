create type workspace_role as enum ('owner', 'admin', 'member');
create type workspace_plan as enum ('free', 'pro');

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 40),
  plan workspace_plan not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create unique index one_owner_per_workspace on workspace_members (workspace_id) where role = 'owner';
create index workspace_members_user_idx on workspace_members (user_id);

-- Helper functions. security definer so RLS policies on workspace_members
-- can call these without recursing into workspace_members' own policy.
create function is_workspace_member(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

create function has_workspace_role(ws uuid, roles workspace_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws and user_id = auth.uid() and role = any(roles)
  );
$$;

-- Deferred from Day 1 to here: needs workspace_members to exist.
create function shares_workspace_with(target uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_members m1
    join workspace_members m2 on m1.workspace_id = m2.workspace_id
    where m1.user_id = auth.uid() and m2.user_id = target
  );
$$;

-- workspace_seat_count is NOT created here: its body counts pending
-- invitations, and the invitations table doesn't exist until Day 4.
-- CREATE FUNCTION for a `language sql` body is validated against the
-- schema at creation time, so referencing a not-yet-existing table would
-- fail the migration. It gets created for the first time on Day 4,
-- alongside invitations and the seat-limit trigger that need it.

alter table workspaces enable row level security;
alter table workspace_members enable row level security;

create policy "members can view their workspace" on workspaces
  for select to authenticated
  using (is_workspace_member(id));

create policy "owner or admin can rename workspace" on workspaces
  for update to authenticated
  using (has_workspace_role(id, array['owner', 'admin']::workspace_role[]))
  with check (has_workspace_role(id, array['owner', 'admin']::workspace_role[]));

create policy "owner can delete workspace" on workspaces
  for delete to authenticated
  using (has_workspace_role(id, array['owner']::workspace_role[]));

-- No INSERT policy: workspaces are only ever created via the
-- create_workspace RPC (security definer, bypasses RLS). No policy at all
-- means direct client inserts are denied by RLS's default-deny.

-- Column-level grants: even with the UPDATE policy above, an owner/admin
-- may only ever change `name` from the client, never plan or the Stripe
-- columns - those are service-role-only (webhook), per CLAUDE.md.
revoke update on workspaces from authenticated;
grant update (name) on workspaces to authenticated;

create policy "members can view workspace membership" on workspace_members
  for select to authenticated
  using (is_workspace_member(workspace_id));

-- No INSERT/UPDATE/DELETE policy: all membership changes go through
-- security definer RPCs (create_workspace, change_member_role,
-- remove_member, leave_workspace - Day 2 task 2 and Day 3), which bypass
-- RLS for their specific, explicitly-checked operations.

-- Second, separate permissive policy on profiles (deferred from Day 1):
-- Postgres ORs multiple permissive policies for the same command, so this
-- adds the co-member case without touching Day 1's self-only policy.
create policy "workspace members can view each other's profile" on profiles
  for select to authenticated
  using (shares_workspace_with(id));
