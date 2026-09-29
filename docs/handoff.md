# Handoff
## Last updated
2026-09-29, 15:35, vscode
## Current task
- [ ] Supabase CLI init, `supabase start` works locally
## Status
not started
## Done so far in this task
- Task 1 (Next.js scaffold) done and committed (4b1c4d9).
- Task 2 (prettier, strict tsconfig, scripts) done and committed (4b49a9e). typecheck/lint/test all green.
- Task 3 (shadcn/ui components) done and committed (93a05ab). typecheck/lint/build all green.
## Files changed (not yet committed)
- None. Working tree is clean.
## Next exact step
Task 4: `npm install --save-dev supabase@2.118.0`, then `npx supabase init`, then `npx supabase start` (Docker Desktop confirmed installed and running — first run will pull Docker images, can take several minutes). After it's up, show the user the local API URL/anon key/service_role key from `supabase status` so they can paste into .env.local themselves — do not write .env.local.
## Decisions made this session
- Scaffolded via a temp dir (scratchpad) + manual move, specifically so create-next-app never wrote into the repo root directly — protects CLAUDE.md, docs/, .env.example. New .gitignore lines were merged into the existing file by hand instead of letting the scaffold overwrite it.
- Stayed on Next.js 15.5.26 (latest 15.x) per CLAUDE.md's stack lock, even though 16.3.6 is the latest overall — confirmed with the user, not deviating.
- `npm audit` reports 2 vulnerabilities (1 high) in `next/node_modules/postcss` (XSS/path traversal in CSS sourcemap handling). The only fix is upgrading to Next 16.3.7, which the user explicitly declined. Accepted as a known tradeoff of the version pin — not fixed.
- Checked shadcn's toast component against live docs: not deprecated, no Sonner substitution needed (was a user-requested check before Task 3).
- typescript pinned to 5.9.3 (typescript-eslint@8.70.1 doesn't support TS7 yet). @types/node bumped from create-next-app's default ^20 to 24.19.0 to match the actual local Node 24 runtime and satisfy vitest 5's peer dependency (vitest 5 requires @types/node >=22).
- vitest.config renamed to .mts and uses import.meta.dirname instead of __dirname, to avoid Vite's CJS/ESM interop warnings under the new native config loader.
## Blockers / open questions for me
- None.
