# Handoff
## Last updated
2026-09-29, 15:01, vscode
## Current task
- [ ] Add Prettier, strict tsconfig, scripts: dev, build, lint, typecheck, test, test:db, test:e2e
## Status
not started
## Done so far in this task
- Task 1 (Next.js scaffold) is done and committed (4b1c4d9). Task 2 not started yet.
## Files changed (not yet committed)
- None. Working tree is clean.
## Next exact step
Task 2: install prettier@3.9.9, eslint-config-prettier@10.1.8, typescript@5.9.3 (pin, since typescript-eslint@8.70.1 doesn't support TS7 yet), vitest@5.0.2, @vitejs/plugin-react@6.1.1, jsdom@30.1.1, @playwright/test@1.63.0. Add .prettierrc, .prettierignore, vitest.config.ts. Verify tsconfig.json strict:true (create-next-app already sets it). Wire package.json scripts: typecheck, test (vitest run --passWithNoTests), test:db (supabase test db), test:e2e (playwright test).
## Decisions made this session
- Scaffolded via a temp dir (scratchpad) + manual move, specifically so create-next-app never wrote into the repo root directly — protects CLAUDE.md, docs/, .env.example. New .gitignore lines were merged into the existing file by hand instead of letting the scaffold overwrite it.
- Stayed on Next.js 15.5.26 (latest 15.x) per CLAUDE.md's stack lock, even though 16.3.6 is the latest overall — confirmed with the user, not deviating.
- `npm audit` reports 2 vulnerabilities (1 high) in `next/node_modules/postcss` (XSS/path traversal in CSS sourcemap handling). The only fix is upgrading to Next 16.3.7, which the user explicitly declined. Accepted as a known tradeoff of the version pin — not fixed.
- Checked shadcn's toast component against live docs: not deprecated, no Sonner substitution needed (was a user-requested check before Task 3).
## Blockers / open questions for me
- None.
