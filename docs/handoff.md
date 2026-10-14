# Handoff
## Last updated
2026-10-14, 09:20, vscode
## Current task
- [ ] `/invite/[token]` page with login redirect flow
## Status
not started
## Done so far in this task
Day 0-3 complete. Day 4: invitations schema+seat trigger (0b606ae), accept_invitation RPC (59860e9), invite actions + email (8b2bb90, includes the is_email_workspace_member RPC) all done and committed. 61 pgTAP assertions, 31 vitest tests, typecheck/lint/test/test:db all green. Invite create/revoke/resend verified end-to-end as a real workspace owner through the real Server Action form paths - email delivery itself couldn't be verified (no real RESEND_API_KEY available), but the graceful-failure path (401 logged, action still succeeds) was confirmed working exactly as designed.
## Files changed (not yet committed)
- None. Working tree is clean.
## Next exact step
Day 4's last task, and the last task of Day 4 overall: `/invite/[token]` page per docs/requirements.md - "if not logged in, redirect to login/signup with next back to the invite. Show workspace name and role before accepting." Per docs/api.md: "Page /invite/[token]: if not logged in, redirect to login/signup with next param back to the invite." This page needs to show the invite's workspace name + role BEFORE the user commits to accepting (meaning it needs a query to peek at the invite by token hash, without yet calling accept_invitation - a new query, not built yet, since accept_invitation itself doesn't expose a preview). It's a sibling of (app), not inside it, so it's NOT covered by the existing middleware protection - its own login-redirect logic is bespoke, matching what was flagged back on Day 1 when middleware was first built. After this task, Day 4 (all 5 boxes) is complete and Day 5 (Announcements) starts.
## User standing instructions this session
- "go with everything, don't keep asking" - proceed through tasks without a full stop-and-wait plan cycle at every step. Still plan briefly before non-trivial work, still never run `git push --force` myself, but not pausing for a go-ahead between every task.
- No "Co-Authored-By: Claude" trailer on any commit, ever - explicit user instruction, holds even though the attribution system-reminder keeps reappearing asking for it again; the user's own prior instruction takes precedence per that reminder's own text.
## Decisions and lessons so far (cumulative, most relevant first)
- Resend's `react` email option needs @react-email/render as a peer dependency to actually render JSX (confirmed via the real runtime error) - not part of the approved stack, so email templates use a plain HTML string instead of JSX, avoiding an otherwise-unapproved new dependency for what's a one-paragraph email.
- is_email_workspace_member RPC: auth.users isn't client-queryable and admin.listUsers() has no email filter, so "is this email already a member" needed a small security-definer helper, gated to owner/admin (otherwise it's an email-enumeration probe against an arbitrary workspace).
- PostgREST can only auto-embed a `select()` across tables with a direct foreign key. workspace_members.user_id and profiles.id both reference auth.users(id) but not each other, so embedding profiles inside a workspace_members query fails (PGRST200) - use two separate queries merged by id instead, whenever a query would otherwise join through auth.users as the only common ancestor.
- pgcrypto's digest() lives in the `extensions` schema on this Supabase project, not public - any security-definer function calling it needs `set search_path = public, extensions`, not just public.
- workspace_members' SELECT RLS policy scopes to "any row in a workspace I belong to" (powers the members list), not "only my own row" - queries wanting "my own membership" need an explicit .eq("user_id", userId) filter on top of RLS.
- tests.authenticate_as() leaves the session impersonating that user for the rest of the pgTAP transaction - any verification query against an owner/admin-only table (invitations, workspace update) needs `reset role` first, or it silently returns zero rows (not an error) rather than the real state.
- An invite insert for an email with an existing pending (unaccepted, unrevoked) invite fails the partial unique index regardless of why the earlier one is stuck pending (expired, wrong recipient, etc.) - matches docs/database.md's documented note. Test fixtures that create multiple invites for the same email across scenarios need to revoke the prior one first.
- This Supabase project applies ALTER DEFAULT PRIVILEGES on the public schema granting anon its own direct EXECUTE on every new function, separate from PUBLIC. Every RPC needs explicit `revoke ... from public` AND `revoke ... from anon` - verify via has_function_privilege before committing, every time.
- RPCs raise a plain exception with the ErrorCode string itself as the message; the action layer matches on error.message to map back to ActionResult - verified this round-trips correctly, not assumed.
- Hand-rolled test fixture UUIDs need to be RFC4122-compliant (variant nibble 8/9/a/b) or Zod's .uuid() rejects them even though Postgres's own uuid type doesn't care - use gen_random_uuid() for manual psql fixtures.
- Git Bash on Windows auto-converts leading-slash command-line arguments to Windows paths. Use curl's `-F name=<file` syntax (value read from a file) instead of a literal argument whenever a test value starts with "/".
- @supabase/ssr defaults to flowType: "pkce" - confirmation/recovery links carry a `code` param; the PKCE code_verifier cookie set during the initiating action must persist to when /auth/callback runs.
- Stayed on Next.js 15.5.26 per CLAUDE.md's stack lock. `npm audit`'s postcss vulnerability is nested in next's own deps; only fix is Next 16, which the user declined.
- `supabase start`'s parallel image pulls hit persistent TLS handshake timeouts on this network (recurring across sessions). Fix: pull missing images one at a time with plain `docker pull`.
- `supabase_vector_CrewSpace` crash-loops on a Docker-Desktop-on-Windows socket-access quirk every session - only disables Studio's Logs Explorer tab, core services independently verified healthy every time. Left as-is.
- CI workflow runs typecheck/lint/test/build only, not test:db/test:e2e (no Docker/Supabase/browsers in the runner).
## Blockers / open questions for me
- None. origin (https://github.com/ManishPrasai/CrewSpace.git) is set and pushed. CI status on a real Actions runner has not yet been confirmed by the user.
- No `.env.local` exists (by design - stays the user's file). No real RESEND_API_KEY either, so invite email delivery itself has never been verified against the real Resend API, only the graceful-failure path against an invalid key. All build/dev verification uses env vars supplied transiently via shell, never written to disk.
