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
**PAUSED** - resumes after Crewspace V2 ships below, so this runs once against the final UI instead of twice. See ADR-011.
- [ ] Playwright: signup > create workspace > invite > accept
- [ ] Playwright: member cannot post announcement
- [ ] Playwright: free plan blocks 6th seat
- [ ] AI security review (see prompts.md) and fix findings
- [ ] Lighthouse check: PWA installable, accessibility

## Day 10 - Ship
**PAUSED** - see Day 9.
- [ ] Deploy to Vercel, connect Supabase cloud, production Stripe webhook endpoint (test mode keys)
- [ ] Seed demo workspace + demo login for clients
- [ ] README: screenshots, features, architecture diagram, security notes, setup steps
- [ ] Record 1 to 2 minute demo video
- [ ] Add to Upwork portfolio as a case study

## Crewspace V2 - "Direction C v2" visual redesign (inserted between Day 8 and Day 9)
Frontend-only rebuild per the claude.ai/design handoff package. Full plan, audit findings and decisions: `C:\Users\Manish Prasai\.claude\plans\bright-inventing-peach.md` and ADR-011. One PR per step, per the design's own `07-implementation-plan.md`.
- [x] 1. Tokens & fonts: `tokens.css` into `globals.css`, Geist/Geist Mono/Instrument Serif via `next/font`, real `BrandMark`-based PWA icon set replacing Day 8's placeholders
- [x] 2. Primitives: Button variants + `SubmitButton`, Input/Textarea/NativeSelect/Field/FormAlert, Spinner/Skeleton, Avatar/AvatarStack/WorkspaceMonogram/RoleBadge/StatusBadge, EmptyState, Tabs/Tooltip (`@base-ui/react`, already installed - no new dependency)
- [ ] 3. Auth & onboarding: restyle signup/login/reset×2/invite×3, add "Forgot password?" link, fix the `updatePassword` → `/` redirect bug (found in audit), build Account → Profile + Password
- [ ] 4. App shell: AppSidebar/AppRail/MobileTabBar, AccountMenu, restyled WorkspaceSwitcher, PanelHeader, `loading.tsx`/`error.tsx`
- [ ] 5. Announcements: composer (`<details>` no-JS fallback), day dividers, edit/delete confirm, load-more end state, toasts, `authorRole` query addition
- [ ] 6. Members: table + role-gated row menus, pending section, InviteDialog, MemberDetailsDialog + `/w/[slug]/members/[memberId]` no-JS fallback
- [ ] 7. Settings: sub-nav, identity/access rows, Danger zone restyle, Account section
- [ ] 8. Billing: PlanCard/PlanCompare/StatusBadge, redirect-pending/error states
- [ ] 9. Marketing `/`: real layout + L2 composition, responsive
- [ ] 10. Dark mode + Appearance toggle, then the full QA pass from `06-accessibility-and-qa.md`
