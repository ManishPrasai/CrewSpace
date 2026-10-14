-- Day 2's "owner can delete workspace" policy only checked role. Add the
-- Day 7 requirement that deletion is blocked while a Pro subscription is
-- live - plan only ever reads 'pro' while the webhook considers the
-- subscription active or trialing (docs/api.md), so gating on plan alone
-- (rather than parsing subscription_status strings) stays correct even
-- through a past_due payment failure, which doesn't touch plan.
drop policy "owner can delete workspace" on workspaces;

create policy "owner can delete workspace" on workspaces
  for delete to authenticated
  using (
    has_workspace_role(id, array['owner']::workspace_role[])
    and plan = 'free'
  );
