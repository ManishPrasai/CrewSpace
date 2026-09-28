# Requirements - Crewspace (SaaS Starter)

## What we are building
A multi-tenant membership SaaS. An organisation (a "workspace") signs up, invites its members, posts announcements to them, and pays a monthly subscription to unlock more members. Members get push notifications on their phone when something new is posted.

## Who it is for
Small communities and teams: clubs, coaching groups, small agencies, paid membership communities.

## Why (portfolio goal)
Show Upwork clients I can build a production-quality SaaS MVP: secure multi-tenant data, roles, subscriptions, invites, and installable mobile experience.

## Users and roles
| Role | Scope | Can do |
|---|---|---|
| Owner | One per workspace | Everything. Manage billing, delete workspace, change any role. |
| Admin | Workspace | Invite and remove members, post/edit/delete announcements, edit workspace name. Cannot manage billing, cannot change Owner or other Admins. |
| Member | Workspace | View announcements, manage own profile and notification settings, leave workspace. |

A user can belong to many workspaces with a different role in each.

## Core features (MVP)
1. **Auth**: email + password sign up with email confirmation, login, logout, password reset.
2. **Profile**: full name, avatar URL.
3. **Workspaces**: create workspace (creator becomes Owner), workspace switcher, rename (Owner/Admin), delete (Owner only).
4. **Members**: list members with roles, change role (rules above), remove member, leave workspace (not allowed for Owner).
5. **Invitations**: Owner/Admin invites by email with a role (Admin or Member). Email contains a link. Link expires after 7 days. Invite can be revoked. Invited user must log in with the same email to accept.
6. **Announcements**: Owner/Admin create, edit, delete. All members can read. Newest first, paginated.
7. **Billing**:
   - Free plan: max 5 members (members + pending invites).
   - Pro plan: unlimited members, monthly subscription through Stripe Checkout.
   - Owner manages or cancels through Stripe Customer Portal.
   - Plan status updated only from Stripe webhooks.
8. **PWA + push notifications**: app installable to phone home screen. Members can enable push. New announcement sends a push to all members except the author.

## Business rules
- Exactly one Owner per workspace at all times.
- A user only ever sees data from workspaces they belong to (enforced by RLS).
- Free plan member limit is enforced in the database, not only in the UI.
- If a Pro subscription ends and the workspace has more than 5 members, existing members stay but no new invites can be sent until back under the limit or upgraded.
- Invitation acceptance is only valid if: token matches, not expired, not revoked, not already accepted, and the logged-in user's email matches the invite email.
- Stripe events are processed once only (idempotent).
- Expired or invalid push subscriptions (404/410 from push service) are deleted automatically.

## Out of scope (do NOT build)
- Native mobile app (comes later in the Expo project)
- OAuth / social login
- AI features
- Comments, reactions, file uploads, rich text editor (plain text + line breaks only)
- Audit logs, analytics dashboards
- Multiple paid plans, annual billing, coupons, usage-based billing
- Transferring ownership
- Super admin panel
- Real-time updates (a page refresh is fine)
- Multi-language support

## Definition of done
- All features above work on the live Vercel URL.
- RLS tests prove a user cannot read or write another workspace's data.
- E2E tests cover: sign up > create workspace > invite > accept; member cannot post; free plan limit blocks 6th member.
- Lighthouse: installable PWA, no major accessibility errors.
- CI passes (typecheck, lint, unit tests, build).
- README with screenshots, setup steps, architecture summary, and a 1 to 2 minute demo video link.
