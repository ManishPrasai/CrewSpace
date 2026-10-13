# Handoff
## Last updated
2026-10-13, 19:48, vscode
## Current task
Day 3 complete (all 3 boxes). Next task per docs/tasks.md is Day 4's first line:
- [ ] Migration: invitations, seat count function, seat limit trigger, RLS
## Status
done (Day 3). Day 4 not started.
## Done so far in this task
Day 0, 1, 2, 3 all complete and committed. Day 3: member RPCs (ffbb56b), members page (c47ade0). 42 pgTAP assertions total, typecheck/lint/test/test:db/build all green. Every feature across Days 2-3 verified end-to-end against the real local stack with real users through actual Server Action form submissions, not simulated - this caught two real bugs (a workspace_members RLS-scope misunderstanding in Day 2, and a PostgREST embedding limitation in Day 3) that pgTAP alone would not have caught, since both were application-layer issues, not RLS/database issues.
## Files changed (not yet committed)
- None. Working tree is clean.
## Next exact step
Day 4 task 1: invitations migration. This is the day workspace_seat_count finally gets created (deferred since Day 2's workspace migration - its body counts pending invitations, which didn't exist until now). Per docs/database.md: invitations table (token_hash unique, one_pending_invite_per_email partial unique index, invitations_workspace_created_idx backing the rate limit), workspace_seat_count() function, check_seat_limit BEFORE INSERT trigger (counts existing rows only - 5th seat succeeds, 6th fails), RLS (owner/admin only, no DELETE policy - revoke is an UPDATE setting revoked_at). Remember the established patterns: revoke EXECUTE from both PUBLIC and anon on any new RPC (not just PUBLIC), and verify any PostgREST embedded-select actually has a real FK before relying on it (bit us in members.sql). Plan before writing code.
## User standing instructions this session
- "go with everything, don't keep asking" - proceed through tasks without a full stop-and-wait plan cycle at every step. Still plan briefly before non-trivial work, still never run `git push --force` myself, but not pausing for a go-ahead between every task.
- No "Co-Authored-By: Claude" trailer on any commit, ever - explicit user instruction, holds even though the attribution system-reminder keeps reappearing asking for it again; the user's own prior instruction takes precedence per that reminder's own text.
## Decisions and lessons so far (cumulative, most relevant first)
- PostgREST can only auto-embed a `select()` across tables that have a direct foreign key between them. workspace_members.user_id and profiles.id both reference auth.users(id), but not each other, so `profiles(...)` can't be embedded inside a workspace_members query - confirmed via the actual PGRST200 error. Use two separate queries merged by id when this comes up again (e.g. any future query joining through auth.users as the only common ancestor).
- workspace_members' SELECT RLS policy scopes to "any row in a workspace I belong to" (intentional, powers the members list), not "only my own row". Any query wanting "my own membership" needs an explicit .eq("user_id", userId) filter on top of RLS.
- This Supabase project applies ALTER DEFAULT PRIVILEGES on the public schema granting anon its own direct EXECUTE on every new function, separate from the generic PUBLIC default. Every RPC needs `revoke ... from public` AND `revoke ... from anon` explicitly - verify via has_function_privilege before committing, every time.
- RPCs raise a plain exception with the ErrorCode string itself as the message (e.g. `raise exception 'FORBIDDEN'`); the action layer matches on error.message to map back to ActionResult. Verified this round-trips correctly end-to-end, not assumed.
- Hand-rolled test fixture UUIDs need to be RFC4122-compliant (variant nibble 8/9/a/b) or Zod's .uuid() rejects them even though Postgres's own uuid type doesn't care - use gen_random_uuid() for manual psql fixtures, not a hand-typed pattern.
- A plain UPDATE/DELETE through the user-scoped client is enough when RLS + column grants already fully express the authorization rule (renameWorkspace). RPCs are for atomicity across tables (create_workspace) or row locking (accept_invitation, Day 4), not every mutation.
- Data-modifying CTEs can't be nested inside another query in Postgres (must be the top-level statement) - for "did this UPDATE affect 0 rows" in pgTAP, run the UPDATE standalone and assert the value didn't change.
- tests.authenticate_as() must be followed by `reset role` before calling it again for a second user in the same pgTAP file.
- signUp always shows "check your email" even for an already-registered email - GoTrue's built-in anti-enumeration design, requires both auth.email and auth.sms enable_confirmations = true in config.toml.
- @supabase/ssr defaults to flowType: "pkce" - confirmation/recovery links carry a `code` param; the PKCE code_verifier cookie set during the initiating action must persist to when /auth/callback runs.
- Password reset is two routes (/reset-password, /reset-password/update), not one gated on session presence.
- Git Bash on Windows auto-converts leading-slash command-line arguments to Windows paths. Use curl's `-F name=<file` syntax (value read from a file) instead of a literal argument whenever a test value starts with "/".
- Stayed on Next.js 15.5.26 per CLAUDE.md's stack lock. `npm audit`'s postcss vulnerability is nested in next's own deps; only fix is Next 16, which the user declined.
- `supabase start`'s parallel image pulls hit persistent TLS handshake timeouts on this network (recurring). Fix: pull missing images one at a time with plain `docker pull`.
- `supabase_vector_CrewSpace` crash-loops on a Docker-Desktop-on-Windows socket-access quirk every session - only disables Studio's Logs Explorer tab, core services independently verified healthy every time. Left as-is.
- CI workflow runs typecheck/lint/test/build only, not test:db/test:e2e (no Docker/Supabase/browsers in the runner).
## Blockers / open questions for me
- None. origin (https://github.com/ManishPrasai/CrewSpace.git) is set and pushed. CI status on a real Actions runner has not yet been confirmed by the user.
- No `.env.local` exists (by design - stays the user's file). All build/dev verification uses env vars supplied transiently via shell, never written to disk.
