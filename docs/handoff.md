# Handoff
## Last updated
2026-10-13, 19:40, vscode
## Current task
- [ ] Members page with role badges and actions shown by role
## Status
not started
## Done so far in this task
Day 0-2 all complete. Day 3 RPCs done and committed (ffbb56b): change_member_role, remove_member, leave_workspace, all with EXECUTE correctly revoked from PUBLIC+anon (verified via has_function_privilege before committing, not assumed). 42 pgTAP assertions total across the whole project, typecheck/lint/test/test:db all green.
## Files changed (not yet committed)
- None. Working tree is clean.
## Next exact step
Day 3's last task: members page at (probably) /w/[slug]/members, per docs/api.md's getMembers(workspaceId) query (profile name, avatar, role, joined date) and the changeMemberRole/removeMember/leaveWorkspace actions wrapping the RPCs just built. Role badges + which actions show depends on viewer's own role (use getMyRole, already built) vs each row's role - e.g. only show "remove" next to a member if viewer is owner, or admin and the row is a plain member. Plan before writing code.
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
