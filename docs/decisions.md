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

## ADR-010: Pro plan price
$29/month USD, picked by the user on Day 6 (docs/requirements.md names the Pro plan but never a price). Created in test mode: product `prod_VRDf1uCEWYrez6` ("Crewspace Pro"), price `price_1UQLM4Fmf9OkLrK8xb8gwF45` (recurring, monthly). `STRIPE_PRICE_PRO_MONTHLY` holds the price id. Changeable later without a migration since nothing besides this env var references the amount.

## ADR-011: Crewspace V2 visual redesign ("Direction C v2") adopted
After Day 8, the user commissioned a full visual/frontend redesign via claude.ai/design, delivered as a 10-file handoff package (`01-product-behavior-spec.md` through `08-authentication.md`, `tokens.css`, `README.md`) plus `.dc.html` design frames. Adopted wholesale as a frontend-only rebuild: new design tokens (`tokens.css` → `globals.css`), a new component library (`src/components/ui/*`, `src/components/app/*`), restyled routes, dark mode, and PWA assets replacing Day 8's placeholders. Zero backend/RLS/action-signature changes except one small, audited addition: a new `updateProfile` action (uses the `profiles` RLS grant that already existed since Day 1 - no migration). An author-role badge on posts was considered (`05-dependencies.md`'s "conditional" query list names it) but correctly **not** built: the design package's own later QA pass (`C v3 - Audit & Corrections.dc.html`, finding R06, severity High, resolved) found that a role badge shows the author's *current* role, not their role when they posted - misleading since roles change over time - and removed it from every post, name + time only. Re-adding it would need `author_role` stored at write time, which is new backend, not a query addition, and isn't planned. Day 9 (Playwright/security review) and Day 10 (ship) are paused until this redesign ships, so testing happens once against the final UI. Full plan and audit trail: `C:\Users\Manish Prasai\.claude\plans\bright-inventing-peach.md`. Explicitly out of scope for this pass: OAuth providers (design marks them "proposed, not implemented"), Pro price display (needs new backend to read the Stripe Price object), co-member emails in the directory (profiles has no email column - would need new backend), ownership transfer.
