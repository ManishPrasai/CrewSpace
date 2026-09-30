# Handoff
## Last updated
2026-09-30, 02:52, vscode
## Current task
Day 0 is complete. Next task per docs/tasks.md is Day 1's first line:
- [ ] Migration: profiles table + trigger on auth.users + RLS
## Status
done (Day 0). Day 1 not started.
## Done so far in this task
All 9 Day 0 boxes in docs/tasks.md are ticked and committed, one commit per task, working tree clean at every step:
- 4b1c4d9 chore: scaffold Next.js app
- 4b49a9e chore: add prettier, strict tsconfig, npm scripts
- 93a05ab feat: add shadcn/ui base components
- 7097f27 chore: init Supabase CLI and local stack
- c78d1a5 feat: add env validation
- 1dedf2c feat: add result and error helpers
- d015cbb feat: add Supabase client helpers
- 4e36062 chore: project setup (CI workflow)
typecheck/lint/test/build all green as of the last commit.
## Files changed (not yet committed)
- None. Working tree is clean.
## Next exact step
Per CLAUDE.md workflow rules, STOP here — do not start Day 1 without the user's go-ahead. When told to proceed: read docs/tasks.md Day 1, docs/database.md (profiles table + RLS + shares_workspace_with helper already spec'd from the earlier review), and docs/api.md's Auth section, then plan the profiles migration + trigger + RLS + its pgTAP tests (per the "same day" testing rule) before writing any SQL.
## Decisions made this session
- Scaffolded via a temp dir (scratchpad) + manual move, specifically so create-next-app never wrote into the repo root directly — protects CLAUDE.md, docs/, .env.example. New .gitignore lines were merged into the existing file by hand instead of letting the scaffold overwrite it.
- Stayed on Next.js 15.5.26 (latest 15.x) per CLAUDE.md's stack lock, even though 16.3.6 is the latest overall — confirmed with the user, not deviating.
- `npm audit` reports 2 vulnerabilities (1 high) in `next/node_modules/postcss` (XSS/path traversal in CSS sourcemap handling). The only fix is upgrading to Next 16.3.7, which the user explicitly declined. Accepted as a known tradeoff of the version pin — not fixed.
- Checked shadcn's toast component against live docs: not deprecated, no Sonner substitution needed.
- typescript pinned to 5.9.3 (typescript-eslint@8.70.1 doesn't support TS7 yet). @types/node bumped to 24.19.0 to match the local Node 24 runtime and satisfy vitest 5's peer dependency.
- `supabase start`'s parallel image pulls hit persistent TLS handshake timeouts on this network. Fixed by pulling the missing images one at a time with plain `docker pull` (lower connection concurrency), then `supabase start` completed instantly against the fully-cached set. If this recurs on a fresh machine, that's the fix.
- `supabase_vector_CrewSpace` crash-loops with a Docker-Desktop-on-Windows socket-access quirk — only disables Studio's Logs Explorer tab, core services (Postgres/Auth/REST/Storage/Realtime/Kong) are all independently verified healthy. Left as-is.
- lib/errors.ts holds just the ErrorCode union; lib/result.ts holds ActionResult<T> + ok()/err(). Deliberately did not build a Postgres-error-mapping helper — no caller exists until Day 2+ features land.
- Supabase client helpers (server/client/admin/middleware) are thin factory wrappers with no branching logic, so no dedicated unit tests — verified via typecheck/lint/build instead. admin.ts has no caller yet, correctly, per CLAUDE.md's restriction.
- CI workflow runs typecheck/lint/test/build only, not test:db/test:e2e (no Docker/Supabase/browsers in the runner). No GitHub remote exists yet — user will create a private repo and hand over the URL; nothing has been pushed.
## Blockers / open questions for me
- No GitHub remote yet. When the user provides the URL, add it as origin and push so CI actually runs (currently untested against a real Actions runner, only verified locally with the same commands).
## Decisions made this session
- Scaffolded via a temp dir (scratchpad) + manual move, specifically so create-next-app never wrote into the repo root directly — protects CLAUDE.md, docs/, .env.example. New .gitignore lines were merged into the existing file by hand instead of letting the scaffold overwrite it.
- Stayed on Next.js 15.5.26 (latest 15.x) per CLAUDE.md's stack lock, even though 16.3.6 is the latest overall — confirmed with the user, not deviating.
- `npm audit` reports 2 vulnerabilities (1 high) in `next/node_modules/postcss` (XSS/path traversal in CSS sourcemap handling). The only fix is upgrading to Next 16.3.7, which the user explicitly declined. Accepted as a known tradeoff of the version pin — not fixed.
- Checked shadcn's toast component against live docs: not deprecated, no Sonner substitution needed (was a user-requested check before Task 3).
- typescript pinned to 5.9.3 (typescript-eslint@8.70.1 doesn't support TS7 yet). @types/node bumped from create-next-app's default ^20 to 24.19.0 to match the actual local Node 24 runtime and satisfy vitest 5's peer dependency (vitest 5 requires @types/node >=22).
- vitest.config renamed to .mts and uses import.meta.dirname instead of __dirname, to avoid Vite's CJS/ESM interop warnings under the new native config loader.
- `supabase start`'s parallel image pulls repeatedly hit TLS handshake timeouts on this network across two full-stack attempts (both spanning session restarts — Claude Code sessions were interrupted mid-pull twice, once by account switch). Root-caused by pulling the 6 still-missing images one at a time with plain `docker pull` instead of supabase's parallel puller — all 6 succeeded sequentially, then `supabase start` completed instantly against the fully-cached image set.
- The `supabase_vector_CrewSpace` container crash-loops with a "Network unreachable" error (its `docker_logs` source can't reach the Docker socket) — known Docker-Desktop-on-Windows quirk with this container's log-tailing approach, not a config issue on our end. Only disables Studio's Logs Explorer tab; Postgres/Auth/REST/Storage/Realtime/Kong are all healthy and independently verified (REST 200, Postgres accepting connections). Left as-is, not worth chasing for Day 0.
## Blockers / open questions for me
- None.
