# Architecture Decision Records

Check this file before proposing any infrastructure or library change.

## ADR-001: Modular monolith in Next.js
One Next.js app with feature folders. No separate API server or microservices. Reason: small team (one developer), MVP scope, simpler deployment.

## ADR-002: Supabase Postgres + RLS for tenant isolation
Relational data (workspaces, members, invites) fits Postgres. RLS enforces isolation at the database level so a bug in app code cannot leak another tenant's data.

## ADR-003: No Prisma / ORM
Queries use supabase-js with the user's session so RLS applies. An ORM with a direct connection would bypass RLS. Schema is managed with SQL migrations via Supabase CLI. Types generated with `supabase gen types`.

## ADR-004: Multi-step writes as Postgres functions
Operations that must be atomic or need row locks (create workspace, accept invite, role changes) are security definer functions with `set search_path = public` and explicit permission checks.

## ADR-005: Plan state only from Stripe webhooks
The app never sets `plan` from a redirect or client action. Webhooks are the single source of truth. Events are deduplicated via `stripe_events`.

## ADR-006: Push sent inline, no queue
At MVP scale (small workspaces) sending push inside the server action is acceptable. If workspaces grow large, move to a background job (e.g. Supabase Edge Function or queue). Not needed now.

## ADR-007: Hashed invitation tokens
Raw token only exists in the email link. Database stores SHA-256 hash. A database leak does not expose usable invite links.

## ADR-008: Email + password auth only
OAuth is out of scope for MVP to keep auth flows simple and testable.

## ADR-009: Webhook handlers re-fetch subscription state from Stripe
Subscription-related webhook events (`checkout.session.completed`, `customer.subscription.updated`) do not trust the event payload for plan/status fields. Instead the handler fetches the current subscription object from the Stripe API and writes plan/subscription_status/current_period_end from that. `checkout.session.completed` only uses the payload to link `stripe_customer_id`/`stripe_subscription_id` to the workspace, then does the same fetch. This makes the result independent of event delivery order, since Stripe does not guarantee webhooks arrive in the order the underlying events occurred.
