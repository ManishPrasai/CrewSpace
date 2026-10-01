# Architecture - Crewspace

## Style
Modular monolith in a single Next.js app. No microservices, no separate backend server, no Redis, no queues for the MVP.

## Stack
| Layer | Choice |
|---|---|
| Frontend + server | Next.js 15 App Router, React Server Components, Server Actions |
| Language | TypeScript (strict) |
| UI | Tailwind CSS + shadcn/ui |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email + password) via @supabase/ssr cookies |
| Authorization | Postgres Row Level Security + security definer functions for multi-step writes |
| Payments | Stripe Checkout, Customer Portal, Webhooks (test mode) |
| Email | Resend (invites). Supabase handles auth emails. |
| Push | web-push library with VAPID keys, service worker in /public/sw.js |
| Validation | Zod |
| Testing | Vitest, pgTAP (`supabase test db`), Playwright |
| CI | GitHub Actions |
| Hosting | Vercel (app) + Supabase cloud (db/auth) |

## Rendering
- Pages are Server Components by default. Use Client Components only for interactivity (forms, dropdowns, push toggle).
- Data reads happen in server-side query functions using the user-scoped Supabase client, so RLS applies.
- Writes happen through Server Actions. Stripe webhook uses a Route Handler.

## Folder structure
```
src/
  app/
    (marketing)/page.tsx            landing page
    (auth)/login, signup, reset-password, reset-password/update, auth/callback
    (app)/
      workspaces/page.tsx           workspace list + create
      w/[slug]/
        page.tsx                    announcements feed
        members/page.tsx
        settings/page.tsx
        billing/page.tsx
    invite/[token]/page.tsx         accept invitation
    api/stripe/webhook/route.ts
    manifest.ts                     PWA manifest
  features/
    auth/          actions.ts schemas.ts components/
    workspaces/    actions.ts queries.ts schemas.ts components/
    members/       actions.ts queries.ts schemas.ts components/
    invitations/   actions.ts queries.ts schemas.ts email.tsx components/
    announcements/ actions.ts queries.ts schemas.ts components/
    billing/       actions.ts queries.ts webhook.ts components/
    push/          actions.ts send.ts components/
  lib/
    supabase/server.ts      user-scoped client (cookies) - default
    supabase/client.ts      browser client
    supabase/admin.ts       service role client - RESTRICTED (see CLAUDE.md)
    supabase/middleware.ts  session refresh
    stripe.ts
    env.ts                  Zod-validated env vars, split server/client
    result.ts               ActionResult type + helpers
    errors.ts               error codes
  components/ui/            shadcn components
  middleware.ts
public/
  sw.js                     service worker (push + notificationclick)
  icons/
supabase/
  migrations/
  tests/                    pgTAP RLS tests
  seed.sql
tests/
  unit/
  e2e/
```

## Key patterns

### Tenant isolation
Every tenant-owned table has `workspace_id`. RLS policies use helper functions `is_workspace_member(ws_id)` and `has_workspace_role(ws_id, roles[])`. The app never passes a user id from the client; Postgres uses `auth.uid()`.

### Atomic operations in Postgres
These run as security definer RPC functions with explicit checks:
- `create_workspace(name, slug)` - insert workspace + owner membership
- `accept_invitation(token)` - validate + lock workspace row + check plan limit + insert membership
- `change_member_role(ws_id, user_id, role)`
- `remove_member(ws_id, user_id)` / `leave_workspace(ws_id)`

### Password reset flow
Two separate routes, not one route that branches on session state (any logged-in user has a session, so that can't be used to distinguish the steps):
1. `/reset-password` - request form (email only). `requestPasswordReset` always returns `ok`, win or lose, and calls `resetPasswordForEmail(email, { redirectTo: `${APP_URL}/auth/callback?next=/reset-password/update` })`.
2. Email link (via Mailpit locally) hits `/auth/callback`, which exchanges the code for a recovery session and redirects to `next`.
3. `/reset-password/update` - new password form. `updatePassword` requires that recovery session; the page itself doesn't check for one, the action just fails naturally if there isn't a valid session.

### Billing flow
1. Owner clicks Upgrade > server action creates Stripe Checkout Session with `client_reference_id = workspace_id` and metadata.
2. Stripe redirects back to /w/[slug]/billing?status=success (UI shows "processing").
3. Webhook updates `workspaces.plan` and subscription fields. The UI never sets the plan.
4. Owner manages subscription via Customer Portal session.

Webhook: verify signature > insert event id into `stripe_events` (skip if exists) > handle event > return 200.
Handled events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.

### Push flow
1. User enables notifications > browser subscribes with VAPID public key > server action saves subscription.
2. Admin posts announcement > after insert, server sends push to members' subscriptions (excluding author) using `Promise.allSettled`.
3. 404/410 responses delete that subscription.
4. iOS requires the app to be added to the home screen (iOS 16.4+). Show a hint in the UI.

Sending inline is fine at MVP scale. See ADR-006.

### Error handling
- Server actions never throw to the client. They return `ActionResult`.
- Unexpected errors are logged server-side with context, and the client gets a generic message.

## Environments
- Local: Supabase CLI (`supabase start`), Stripe CLI for webhooks (`stripe listen`)
- Production: Vercel + Supabase cloud + Stripe test mode
