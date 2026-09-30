# Tasks - Crewspace

Work top to bottom. One task at a time. Tick the box when done, tests pass, and it is committed.
Target: about 10 working days.

Every day that adds or changes a table writes that table's pgTAP tests the same day, not deferred to Day 9. Day 9 is for Playwright E2E and the security review, not for RLS coverage that should already exist.

## Day 0 - Setup
- [x] Create Next.js 15 app (TypeScript, Tailwind, ESLint, src dir, App Router)
- [x] Add Prettier, strict tsconfig, scripts: dev, build, lint, typecheck, test, test:db, test:e2e
- [x] Install shadcn/ui base components (button, input, card, dialog, dropdown, toast)
- [x] Supabase CLI init, `supabase start` works locally
- [x] `lib/env.ts` with Zod validation, `.env.example`
- [x] `lib/result.ts`, `lib/errors.ts`
- [x] Supabase clients: server, browser, admin, middleware session refresh
- [ ] GitHub Actions CI: typecheck, lint, unit tests, build
- [ ] Commit: `chore: project setup`

## Day 1 - Auth
- [ ] Migration: profiles table + trigger on auth.users + RLS
- [ ] Sign up, login, logout, password reset pages and actions
- [ ] `/auth/callback` route with safe `next` redirect
- [ ] Middleware protects (app) routes
- [ ] Tests: Zod schemas, safe redirect helper
- [ ] pgTAP: profiles - self can select/update own row, cannot select an unrelated user's profile

## Day 2 - Workspaces
- [ ] Migration: enums, workspaces, workspace_members, helper functions, RLS, column grants
- [ ] RPC `create_workspace`
- [ ] Workspace list + create form + slug validation
- [ ] Workspace layout with switcher at `/w/[slug]` (404 if not member)
- [ ] Rename workspace (owner/admin)
- [ ] pgTAP: cross-tenant isolation, cannot update plan from client, member can select profile of a workspace-mate but not an unrelated user

## Day 3 - Members and roles
- [ ] RPCs: change_member_role, remove_member, leave_workspace
- [ ] Members page with role badges and actions shown by role
- [ ] pgTAP: owner cannot be removed, admin cannot remove admin, member cannot change roles

## Day 4 - Invitations
- [ ] Migration: invitations, seat count function, seat limit trigger, RLS
- [ ] RPC accept_invitation (email match, expiry, lock, seat check)
- [ ] Create / revoke / resend invite actions, Resend email template
- [ ] `/invite/[token]` page with login redirect flow
- [ ] pgTAP: wrong email, expired, revoked, reused token, 6th seat blocked

## Day 5 - Announcements
- [ ] Migration: announcements + RLS + updated_at trigger
- [ ] Feed page with cursor pagination
- [ ] Create / edit / delete (owner/admin only in UI and RLS)
- [ ] pgTAP: member cannot write, other workspace cannot read

## Day 6 - Billing
- [ ] Stripe product + monthly price in test mode
- [ ] createCheckoutSession, createPortalSession (owner only)
- [ ] Migration: stripe_events
- [ ] Webhook route: signature check, idempotency, 4 event handlers
- [ ] Billing page: current plan, seats used, upgrade / manage buttons
- [ ] pgTAP: stripe_events not readable by authenticated users
- [ ] Test with Stripe CLI: upgrade, cancel, payment failure

## Day 7 - Plan limits and hardening
- [ ] Downgrade behaviour: invites blocked when over limit, clear UI message
- [ ] Delete workspace (owner, confirm slug, blocked while subscription active)
- [ ] Invitation rate limit
- [ ] Unit tests for webhook event mapping

## Day 8 - PWA and push
- [ ] `app/manifest.ts`, icons, service worker registration
- [ ] VAPID keys, push enable/disable toggle, save/delete subscription
- [ ] Send push on new announcement, cleanup of 404/410
- [ ] iOS "Add to Home Screen" hint
- [ ] Test on Android Chrome and iPhone

## Day 9 - Testing and security review
- [ ] Playwright: signup > create workspace > invite > accept
- [ ] Playwright: member cannot post announcement
- [ ] Playwright: free plan blocks 6th seat
- [ ] AI security review (see prompts.md) and fix findings
- [ ] Lighthouse check: PWA installable, accessibility

## Day 10 - Ship
- [ ] Deploy to Vercel, connect Supabase cloud, production Stripe webhook endpoint (test mode keys)
- [ ] Seed demo workspace + demo login for clients
- [ ] README: screenshots, features, architecture diagram, security notes, setup steps
- [ ] Record 1 to 2 minute demo video
- [ ] Add to Upwork portfolio as a case study
