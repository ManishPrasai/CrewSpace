# Handoff
## Last updated
2026-09-30, 02:45, vscode
## Current task
- [ ] GitHub Actions CI: typecheck, lint, unit tests, build
## Status
not started
## Done so far in this task
- Tasks 1-6 done (see git log 4b1c4d9..1dedf2c). All typecheck/lint/test/build green throughout.
- Task 7 (Supabase clients) done and committed (d015cbb). server.ts/client.ts/admin.ts/middleware.ts + root src/middleware.ts, all reading config from lib/env.ts. admin.ts has no caller yet (correctly, per CLAUDE.md restriction — no webhook/push/invite flow exists until later days). No dedicated test (thin wrappers, no branching); verified via typecheck/lint/build, middleware confirmed compiling into its own 190kB bundle.
## Files changed (not yet committed)
- None. Working tree is clean.
## Next exact step
Task 8, the last Day 0 task: create `.github/workflows/ci.yml` — checkout, setup-node pinned to Node 24 (matches local runtime), `npm ci`, then typecheck/lint/test/build. Deliberately NOT running test:db or test:e2e in CI (no Docker/Supabase/browsers available in the runner yet, and tasks.md's own CI line only asks for typecheck/lint/unit/build). This commit's message should be exactly "chore: project setup" per tasks.md's final Day 0 line. After this commit, tick tasks.md's last two boxes (CI line + the "Commit: chore: project setup" line itself), update handoff.md, and STOP — do not start Day 1. No GitHub remote exists yet; the user said they'll create a private repo and hand over the URL later, so do not push.
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
