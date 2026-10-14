create table stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- RLS enabled with no policies: nothing is reachable through PostgREST,
-- authenticated or anon. Only the admin (service role) client used by
-- the webhook handler bypasses RLS entirely.
alter table stripe_events enable row level security;
