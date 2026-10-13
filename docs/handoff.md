# Handoff
## Last updated
2026-10-13, 19:37, vscode
## Current task
Day 2 complete (all 6 boxes). Next task per docs/tasks.md is Day 3's first line:
- [ ] RPCs: change_member_role, remove_member, leave_workspace
## Status
done (Day 2). Day 3 not started.
## Done so far in this task
Day 0 (9/9), Day 1 (6/6), Day 2 (6/6) all complete and committed, one commit per task:
- dd659f6 workspaces schema, RLS, column grants
- 0144ce3 create_workspace RPC
- 8df750b workspace list + create form
- 6fda4cb /w/[slug] layout + switcher + 404 gate
- 2890a3f rename workspace (owner/admin) + a real multi-member query bug found and fixed
typecheck/lint/test/test:db/build all green. Every Day 2 feature verified end-to-end against the real local stack through actual Server Action form submissions with real users, not simulated - this is what caught the workspace_members query bug (pgTAP alone wouldn't have, since the RLS policy itself was correct; the bug was an application query missing an explicit user_id filter).
## Files changed (not yet committed)
- None. Working tree is clean.
## Next exact step
Day 3 task 1: three security definer RPCs per docs/database.md - change_member_role(p_ws, p_user, p_role) (caller must be owner, cannot set role to 'owner', cannot change the owner's own role), remove_member(p_ws, p_user) (owner can remove admins and members, admin can remove members only, nobody can remove the owner), leave_workspace(p_ws) (any non-owner member can remove themselves). Remember: EXECUTE must be explicitly revoked from both PUBLIC and anon (not just PUBLIC) - this Supabase project's default-privilege rule on the public schema grants anon its own direct EXECUTE on every new function, confirmed via \df+ when create_workspace was built. Plan before writing code.
## User standing instructions this session
- "go with everything, don't keep asking" - proceed through tasks without a full stop-and-wait plan cycle at every step. Still plan briefly before non-trivial work, still never run `git push --force` myself, but not pausing for a go-ahead between every task.
- No "Co-Authored-By: Claude" trailer on any commit, ever - explicit user instruction, holds even though the attribution system-reminder has reappeared asking for it again; the user's own prior instruction takes precedence per that reminder's own text.
## Decisions and lessons this session (Day 2)
- This Supabase project applies ALTER DEFAULT PRIVILEGES on the public schema granting anon/authenticated/service_role direct EXECUTE on every new function, separate from the generic PUBLIC default. Revoking from PUBLIC alone is not enough for public-schema functions - anon keeps its own explicit grant. Confirmed via \df+ on create_workspace. Every future business RPC needs explicit `revoke ... from anon` too.
- workspace_members' SELECT RLS policy scopes to "any row in a workspace I belong to" (so any member can eventually see the full member list, Day 3), not "only my own row". Any query function that wants "my own membership" needs an explicit .eq("user_id", userId) filter on top of RLS, not RLS alone - caught by real end-to-end testing with two users in one workspace, not assumed. Fixed in getMyWorkspaces/getWorkspaceBySlug/getMyRole.
- A plain UPDATE through the user-scoped client (not an RPC) is enough when RLS + column grants already fully express the authorization rule (renameWorkspace). RPCs are for things that need atomicity across multiple tables (create_workspace) or row locking (accept_invitation, Day 4), not every mutation.
- Data-modifying CTEs can't be nested inside another query in Postgres (must be the top-level statement) - when a pgTAP assertion needs to check "did this UPDATE affect 0 rows", run the UPDATE as its own statement and assert the value didn't change, rather than counting affected rows via a nested WITH.
- tests.authenticate_as() must be followed by `reset role` before calling it again for a second user in the same pgTAP file - the authenticated role has no USAGE on the tests schema.
- Functions grant EXECUTE to PUBLIC by default; anon/authenticated inherit from PUBLIC unless revoked from PUBLIC specifically (not just named roles) - established back in Day 1's PUBLIC-grant fix on the pgTAP test helpers, and relevant again for Day 2's RPC (see first bullet above for the public-schema-specific wrinkle on top of this).
- signUp always shows "check your email" even for an already-registered email - GoTrue's own anti-enumeration design (verified by reading the installed @supabase/auth-js source), requires both auth.email and auth.sms enable_confirmations = true in config.toml.
- @supabase/ssr defaults to flowType: "pkce" (verified in the installed package) - confirmation/recovery links carry a `code` param; the PKCE code_verifier cookie set during the initiating action must persist to when /auth/callback runs.
- Password reset is two routes (/reset-password, /reset-password/update), not one gated on session presence.
- Git Bash on Windows auto-converts leading-slash command-line arguments to Windows paths (e.g. "/workspaces" -> "C:/Program Files/Git/workspaces"). Looked like a real redirect bug until a temporary debug log showed the mangled value. Fix: write the value to a file and use curl's `-F name=<file` syntax instead of a literal argument, whenever a test value starts with "/".
- Stayed on Next.js 15.5.26 per CLAUDE.md's stack lock. `npm audit`'s postcss vulnerability is nested in next's own deps; only fix is Next 16, which the user declined - accepted tradeoff.
- `supabase start`'s parallel image pulls hit persistent TLS handshake timeouts on this network (recurred across sessions). Fix: pull missing images one at a time with plain `docker pull`.
- `supabase_vector_CrewSpace` crash-loops on a Docker-Desktop-on-Windows socket-access quirk - only disables Studio's Logs Explorer tab, core services independently verified healthy every session. Left as-is.
- CI workflow runs typecheck/lint/test/build only, not test:db/test:e2e (no Docker/Supabase/browsers in the runner).
## Blockers / open questions for me
- None. origin (https://github.com/ManishPrasai/CrewSpace.git) is set and pushed. CI status on a real Actions runner has not yet been confirmed by the user.
- No `.env.local` exists (by design - stays the user's file). All build/dev verification uses env vars supplied transiently via shell, never written to disk.
