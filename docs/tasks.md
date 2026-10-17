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
- [x] GitHub Actions CI: typecheck, lint, unit tests, build
- [x] Commit: `chore: project setup`

## Day 1 - Auth
- [x] Migration: profiles table + trigger on auth.users + RLS
- [x] Sign up, login, logout, password reset pages and actions
- [x] `/auth/callback` route with safe `next` redirect
- [x] Middleware protects (app) routes
- [x] Tests: Zod schemas, safe redirect helper
- [x] pgTAP: profiles - self can select/update own row, cannot select an unrelated user's profile

## Day 2 - Workspaces
- [x] Migration: enums, workspaces, workspace_members, helper functions, RLS, column grants
- [x] RPC `create_workspace`
- [x] Workspace list + create form + slug validation
- [x] Workspace layout with switcher at `/w/[slug]` (404 if not member)
- [x] Rename workspace (owner/admin)
- [x] pgTAP: cross-tenant isolation, cannot update plan from client, member can select profile of a workspace-mate but not an unrelated user

## Day 3 - Members and roles
- [x] RPCs: change_member_role, remove_member, leave_workspace
- [x] Members page with role badges and actions shown by role
- [x] pgTAP: owner cannot be removed, admin cannot remove admin, member cannot change roles

## Day 4 - Invitations
- [x] Migration: invitations, seat count function, seat limit trigger, RLS
- [x] RPC accept_invitation (email match, expiry, lock, seat check)
- [x] Create / revoke / resend invite actions, Resend email template
- [x] `/invite/[token]` page with login redirect flow
- [x] pgTAP: wrong email, expired, revoked, reused token, 6th seat blocked

## Day 5 - Announcements
- [x] Migration: announcements + RLS + updated_at trigger
- [x] Feed page with cursor pagination
- [x] Create / edit / delete (owner/admin only in UI and RLS)
- [x] pgTAP: member cannot write, other workspace cannot read

## Day 6 - Billing
- [x] Stripe product + monthly price in test mode
- [x] createCheckoutSession, createPortalSession (owner only)
- [x] Migration: stripe_events
- [x] Webhook route: signature check, idempotency, 4 event handlers
- [x] Billing page: current plan, seats used, upgrade / manage buttons
- [x] pgTAP: stripe_events not readable by authenticated users
- [x] Test with Stripe CLI: upgrade, cancel, payment failure

## Day 7 - Plan limits and hardening
- [x] Downgrade behaviour: invites blocked when over limit, clear UI message
- [x] Delete workspace (owner, confirm slug, blocked while subscription active)
- [x] Invitation rate limit
- [x] Unit tests for webhook event mapping

## Day 8 - PWA and push
- [x] `app/manifest.ts`, icons, service worker registration
- [x] VAPID keys, push enable/disable toggle, save/delete subscription
- [x] Send push on new announcement, cleanup of 404/410
- [x] iOS "Add to Home Screen" hint
- [ ] Test on Android Chrome and iPhone (needs the user - a real device, not something this session can do)

## Day 9 - Testing and security review
**UN-PAUSED** - Crewspace V2 (below) is complete as of 2026-10-15. See ADR-014.
- [x] Playwright: signup > create workspace > invite > accept
- [x] Playwright: member cannot post announcement
- [x] Playwright: free plan blocks 6th seat
- [x] AI security review (see prompts.md) and fix findings
- [x] Lighthouse check: PWA installable, accessibility
- [ ] Screen-reader smoke test (VoiceOver/NVDA) on the feed, members and dialogs - genuinely not done yet, needs a real screen reader (06-accessibility-and-qa.md item 17)
- [ ] Frame-by-frame visual comparison against L2/D1-D6/S1-S15/A1-A10/W1-W2/M1-M4 at 1440/1280/1024/768/390/360 - spot-checked during each redesign step, not run as one exhaustive pass (06-accessibility-and-qa.md item 28)

## Day 10 - Ship
**UN-PAUSED** - see Day 9.
- [ ] Deploy to Vercel, connect Supabase cloud, production Stripe webhook endpoint (test mode keys)
- [ ] Seed demo workspace + demo login for clients
- [ ] README: screenshots, features, architecture diagram, security notes, setup steps
- [ ] Record 1 to 2 minute demo video
- [ ] Add to Upwork portfolio as a case study

## Crewspace V2 - "Direction C v2" visual redesign (inserted between Day 8 and Day 9)
Frontend-only rebuild per the claude.ai/design handoff package. Full plan, audit findings and decisions: `C:\Users\Manish Prasai\.claude\plans\bright-inventing-peach.md` and ADR-011. One PR per step, per the design's own `07-implementation-plan.md`.
- [x] 1. Tokens & fonts: `tokens.css` into `globals.css`, Geist/Geist Mono/Instrument Serif via `next/font`, real `BrandMark`-based PWA icon set replacing Day 8's placeholders
- [x] 2. Primitives: Button variants + `SubmitButton`, Input/Textarea/NativeSelect/Field/FormAlert, Spinner/Skeleton, Avatar/AvatarStack/WorkspaceMonogram/RoleBadge/StatusBadge, EmptyState, Tabs/Tooltip (`@base-ui/react`, already installed - no new dependency)
- [x] 3. Auth & onboarding: restyle signup/login/reset×2/invite×3, "Forgot password?" link, fixed the `updatePassword` → `/` redirect bug, `updateProfile` action + `getMyProfile` query built (UI wiring deferred to the Settings step), invite page's F9 "wrong account" state added
- [x] 4. App shell: AppSidebar/AppRail/MobileTabBar, AccountMenu, restyled WorkspaceSwitcher, PanelHeader, `loading.tsx`/`error.tsx`
- [x] 5. Announcements: composer (`<details>` no-JS fallback, N/⌘Enter), day dividers, edit/delete `ConfirmDialog`, load-more end state, toasts (new `Toaster` mounted globally); no `authorRole` addition (R06 - see ADR-011)
- [x] 6. Members: table + role-gated row ⋯ menus, pending section (ConfirmDialog on Revoke), InviteDialog; no separate MemberDetailsDialog - the `/w/[slug]/members/[memberId]` page serves as both the details view and the no-JS fallback (see decisions.md)
- [x] 7. Settings: sub-nav (anchors, since General/Account are the only real content on this one route), identity/access rows, Danger zone restyle, Account section wiring `updateProfile`/`getMyProfile` and a link to change password
- [x] 8. Billing: PlanCard/PlanCompare, StatusBadge finally wired up, redirect-pending/error states (`?status=success`/`cancelled`, pre-existing)
- [x] 9. Marketing `/`: real `(marketing)/layout.tsx` (nav + footer) + L2 composition, responsive (hero visual simplified to feed+toast per the design's own allowed fallback, L3)
- [x] 10. Dark mode + Appearance toggle (cookie + blocking inline script, no SSR cookie read - see ADR-013), plus a targeted fix pass against `06-accessibility-and-qa.md` (skip link, feed `ol>li>article`/`h2`/`time[datetime]`, reduced-motion `transition-duration`); the full 24-test matrix, Lighthouse and screen-reader passes are Day 9's job now (see ADR-014)

**V2 redesign complete (2026-10-15).** All 10 steps shipped, committed, pushed. See ADR-011 through ADR-014.
