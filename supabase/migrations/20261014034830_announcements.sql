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

create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger announcements_set_updated_at before update on announcements
  for each row execute function set_updated_at();

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
