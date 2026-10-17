# CLAUDE.md - Project Rules for Crewspace

Crewspace is a multi-tenant membership SaaS (working name, can be renamed).
Read this file fully before every task. Also read the relevant file in /docs before changing code.

## Session handoff (mandatory)
Two Claude Code sessions from different accounts work on this repo. Either can stop suddenly when usage runs out, so never keep progress only in your head.

At the START of every session:
- Read docs/handoff.md, then run: git status, git log --oneline -10, git diff
- If there are uncommitted changes, compare them with handoff.md before doing anything. Tell me what you found and what you plan to continue.

DURING work:
- After every completed step (not only at the end), update docs/handoff.md.
- Commit working progress often. If a task is half done but the code compiles, commit with a "wip:" prefix.
- Any new decision goes into the right doc (decisions.md, database.md, etc.) immediately, not only into handoff.md.

When I say "wrap up":
- Stop coding, update handoff.md fully, commit everything that compiles, and tell me the next exact step.

## Source of truth
- docs/requirements.md - what we are building and what is OUT OF SCOPE
- docs/architecture.md - stack, folder structure, patterns
- docs/database.md - schema, constraints, RLS policies
- docs/api.md - server actions, route handlers, response format
- docs/decisions.md - architecture decisions (ADRs). Check before proposing infrastructure changes.
- docs/tasks.md - the task list. Work only on the task you are given.

If a request conflicts with these docs, STOP and ask. Do not silently deviate.

## Stack (do not change without approval)
- Next.js 15 (App Router) + TypeScript (strict)
- Supabase: Postgres, Auth, Row Level Security
- @supabase/ssr for auth cookies
- Stripe (subscriptions, Checkout, Customer Portal), test mode only
- Resend for invitation emails
- web-push (VAPID) + service worker for push notifications
- Tailwind CSS + shadcn/ui
- Zod for all validation
- Vitest (unit), pgTAP via `supabase test db` (RLS), Playwright (E2E)
- Deployed on Vercel, database on Supabase cloud

## General rules
- TypeScript strict. No `any` unless justified in a comment.
- Do not add new dependencies without asking first.
- Prefer existing utilities over creating duplicates. Search before writing.
- Keep files small and focused. One component per file.
- Do not modify files unrelated to the current task.
- Do not implement features listed as out of scope.

## Security rules (non-negotiable)
- Tenant isolation is enforced by Postgres RLS. Never rely on UI checks alone.
- Every table in the public schema has RLS enabled. New tables need policies AND tests.
- The service role key is ONLY used in: Stripe webhook handler and push sender. Never import `lib/supabase/admin.ts` anywhere else. (The invitation email flow uses the normal RLS-scoped client, not the service role - it doesn't need to bypass RLS.)
- Never expose secrets to the client. Only `NEXT_PUBLIC_*` env vars may reach the browser.
- Validate all input with Zod at the boundary (server actions, route handlers).
- Verify Stripe webhook signatures. Process each Stripe event id only once.
- Invitation tokens are stored hashed (SHA-256), never in plain text.
- Authorization checks happen on the server, every time.

## Architecture rules
- Business logic lives in `src/features/<feature>/` (actions, queries, schemas), not in page components.
- Pages and components call feature functions. They do not query the database directly.
- Multi-step writes that must be atomic go into Postgres functions (RPC), not multiple client calls.
- All server actions return the standard result shape from docs/api.md.
- Database changes ONLY via new migration files in `supabase/migrations`. Never edit an applied migration.

## Testing rules
- Every business rule and every RLS policy needs a test.
- Do NOT change a test just to make it pass. If a test fails, find out why. Only change the test if the test itself is wrong, and explain why.
- After changes, run: `npm run typecheck && npm run lint && npm test`. Run `npm run test:db` after any migration.

## Workflow rules
- For any non-trivial task, FIRST reply with a plan: what you found, what will change, which files, risks, how you will test. Wait for approval before coding.
- Work in small vertical slices. Stop when the task is done. Do not start the next task.
- If a change touches more than ~10 files or ~400 lines, stop and explain why before continuing.
- After finishing, update the checkbox in docs/tasks.md and summarise what changed.

## Git
- Small commits using conventional commits: feat:, fix:, test:, refactor:, docs:, chore:
- Never commit .env files or secrets.

## Conventions
- camelCase variables and functions, PascalCase components and types
- kebab-case file names (e.g. `invite-member-form.tsx`)
- Database: snake_case tables and columns, plural table names
- Prettier + ESLint defaults, no disabling rules without a comment
