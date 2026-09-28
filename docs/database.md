# Database Design - Crewspace

Postgres on Supabase. All tables in `public` have RLS enabled. This is the target design; implement it through migrations in `supabase/migrations`, one slice at a time (see tasks.md).

## Entity overview
```
auth.users (Supabase)
   |
profiles (1:1)
   |
workspace_members (many-to-many with role) ---- workspaces
                                                   |
                                   invitations, announcements
push_subscriptions (per user)
stripe_events (service role only)
```

## Enums
```sql
create type workspace_role as enum ('owner', 'admin', 'member');
create type workspace_plan as enum ('free', 'pro');
```

## Tables

### profiles
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 100),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  created_at timestamptz not null default now()
);
```
Created automatically by a trigger on `auth.users` insert. `avatar_url` is optional; when null the UI shows initials as a fallback.

### workspaces
```sql
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
```

### workspace_members
```sql
create table workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create unique index one_owner_per_workspace on workspace_members (workspace_id) where role = 'owner';
create index workspace_members_user_idx on workspace_members (user_id);
```

### invitations
```sql
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
```
Note: an expired but unaccepted invite still blocks a new one for that email. The invite action should revoke the expired one first, or re-send.

`invitations_workspace_created_idx` backs the invite rate limit: `createInvitation` counts rows in `invitations` for that `workspace_id` with `created_at > now() - interval '1 hour'` and rejects with `RATE_LIMITED` at 20. No separate rate-limit table.

### announcements
```sql
create table announcements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index announcements_feed_idx on announcements (workspace_id, created_at desc);
```

### push_subscriptions
```sql
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on push_subscriptions (user_id);
```

### stripe_events
```sql
create table stripe_events (
  id text primary key,            -- Stripe event id (evt_...)
  type text not null,
  processed_at timestamptz not null default now()
);
```
RLS enabled with NO policies: only the service role can access it.

## Helper functions
```sql
create function is_workspace_member(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

create function shares_workspace_with(target uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_members m1
    join workspace_members m2 on m1.workspace_id = m2.workspace_id
    where m1.user_id = auth.uid() and m2.user_id = target
  );
$$;

create function has_workspace_role(ws uuid, roles workspace_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws and user_id = auth.uid() and role = any(roles)
  );
$$;

create function workspace_seat_count(ws uuid) returns integer
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from workspace_members where workspace_id = ws)::int
  + (select count(*) from invitations
       where workspace_id = ws and accepted_at is null
         and revoked_at is null and expires_at > now())::int;
$$;
```
Security definer is used so policies on `workspace_members` do not recurse into themselves.

## RLS policies

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | self, or shares a workspace | trigger only | self | none (cascade) |
| workspaces | member | via `create_workspace` RPC only | owner/admin, **only `name` column** | owner only |
| workspace_members | member of same workspace | via RPC only | via RPC only | via RPC only |
| invitations | owner/admin | owner/admin (+ seat limit check) | owner/admin (revoke) | none |
| announcements | member | owner/admin, `author_id = auth.uid()` | owner/admin | owner/admin |
| push_subscriptions | own rows | own rows | none | own rows |
| stripe_events | none | none | none | none |

`profiles` SELECT policy uses `shares_workspace_with(id)` (in addition to `id = auth.uid()`) so a member can see the profile of anyone they share a workspace with, without the policy recursing into `workspace_members` directly.

Column-level protection for billing fields:
```sql
revoke update on workspaces from authenticated;
grant update (name) on workspaces to authenticated;
```
So even an Owner cannot set `plan = 'pro'` from the client. Only the service role (webhook) can.

Example policies:
```sql
alter table announcements enable row level security;

create policy "members read announcements" on announcements
  for select to authenticated using (is_workspace_member(workspace_id));

create policy "admins create announcements" on announcements
  for insert to authenticated
  with check (has_workspace_role(workspace_id, array['owner','admin']::workspace_role[])
              and author_id = auth.uid());

create policy "admins update announcements" on announcements
  for update to authenticated
  using (has_workspace_role(workspace_id, array['owner','admin']::workspace_role[]))
  with check (has_workspace_role(workspace_id, array['owner','admin']::workspace_role[]));

create policy "admins delete announcements" on announcements
  for delete to authenticated
  using (has_workspace_role(workspace_id, array['owner','admin']::workspace_role[]));
```

## RPC functions (security definer, `set search_path = public`)

### create_workspace(p_name text, p_slug text) returns uuid
- Requires `auth.uid()` not null.
- Insert workspace, insert owner membership in the same transaction. Return id.

### accept_invitation(p_token text) returns uuid (workspace_id)
1. Hash token with `encode(digest(p_token, 'sha256'), 'hex')` (pgcrypto).
2. Find invite by hash. Fail if not found, revoked, accepted, or expired.
3. Fail if invite email != email of `auth.uid()` (from auth.users).
4. `select ... from workspaces where id = invite.workspace_id for update` (lock row, prevents race on seat limit).
5. If user already a member: mark invite accepted, return.
6. If plan = 'free' and member count >= 5: fail with `SEAT_LIMIT`. (The pending invite itself is counted in seats, so check members only here.)
7. Insert membership with invite role, set `accepted_at = now()`.

### change_member_role(p_ws uuid, p_user uuid, p_role workspace_role)
- Caller must be owner.
- Cannot set role to 'owner' (ownership transfer out of scope). Cannot change the owner's own role.

### remove_member(p_ws uuid, p_user uuid)
- Owner can remove admins and members. Admin can remove members only. Nobody can remove the owner.

### leave_workspace(p_ws uuid)
- Any non-owner member can remove themselves.

## Seat limit on invite
`check_seat_limit` BEFORE INSERT trigger on `invitations` rejects the new row when `plan = 'free'` and `workspace_seat_count(workspace_id) >= 5`, counting only rows that already exist (the row being inserted is not yet counted, so the 5th seat succeeds and the 6th fails). Raises a clear error code `SEAT_LIMIT`.

## Triggers
- `on_auth_user_created`: insert into profiles.
- `set_updated_at` on announcements.
- `check_seat_limit` BEFORE INSERT on invitations.

## RLS tests required (pgTAP, supabase/tests)
- User A cannot select workspaces, members, invitations, announcements of workspace B.
- Member cannot insert/update/delete announcements.
- Admin cannot update `plan` or stripe columns on workspaces.
- Owner cannot update `plan` from client.
- Member cannot select invitations.
- 5th seat on free plan succeeds; 6th seat (members + pending invites) is blocked with `SEAT_LIMIT`.
- accept_invitation fails for wrong email, expired, revoked, reused token.
- Nobody can remove the owner; admin cannot remove an admin.
- User can only see/delete own push subscriptions.
- stripe_events not readable by authenticated users.
- A user can select the profile of someone they share a workspace with, but not an unrelated user's profile.
