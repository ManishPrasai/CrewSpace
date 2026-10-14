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

alter table push_subscriptions enable row level security;

create policy "own push subscriptions select" on push_subscriptions
  for select to authenticated using (user_id = auth.uid());

create policy "own push subscriptions insert" on push_subscriptions
  for insert to authenticated with check (user_id = auth.uid());

create policy "own push subscriptions delete" on push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

-- No update policy (docs/database.md's RLS matrix: update "none") -
-- savePushSubscription achieves upsert-on-endpoint semantics by
-- deleting then re-inserting rather than an SQL-level upsert, so no
-- row is ever updated in place.
