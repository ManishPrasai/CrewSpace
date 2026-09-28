# API Contracts - Crewspace

Writes use Server Actions. The only Route Handler is the Stripe webhook (plus auth callback).

## Standard result shape
```ts
// src/lib/result.ts
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> } };

export type ErrorCode =
  | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION'
  | 'CONFLICT' | 'SEAT_LIMIT' | 'INVITE_INVALID' | 'RATE_LIMITED' | 'INTERNAL';
```
Rules:
- Validate input with the feature's Zod schema first. On failure return `VALIDATION` with `fieldErrors`.
- Map Postgres errors to codes (unique violation > `CONFLICT`, RLS denial > `FORBIDDEN`, custom `SEAT_LIMIT`).
- Never return raw database or Stripe error messages to the client.
- Call `revalidatePath` after successful writes.

## Auth (features/auth)
| Action | Input | Notes |
|---|---|---|
| signUp | email, password (min 8), fullName | Sends confirmation email |
| signIn | email, password | Generic error on failure (no user enumeration) |
| signOut | none | |
| requestPasswordReset | email | Always returns ok |
| updatePassword | password | Requires recovery session |

Route: `GET /auth/callback` exchanges code for session, redirects to `next` param (must be a relative path only).

## Workspaces (features/workspaces)
| Action | Input | Who | Returns |
|---|---|---|---|
| createWorkspace | name, slug | any logged-in user | { slug } |
| renameWorkspace | workspaceId, name | owner, admin | void |
| deleteWorkspace | workspaceId, confirmSlug | owner | void. Blocked with a clear error unless there is no subscription or `subscription_status = 'canceled'`. The action never calls Stripe to cancel — the Owner must cancel via the Customer Portal first. |

Queries: `getMyWorkspaces()`, `getWorkspaceBySlug(slug)` (returns null if not a member), `getMyRole(workspaceId)`.

## Members (features/members)
| Action | Input | Who |
|---|---|---|
| changeMemberRole | workspaceId, userId, role ('admin' or 'member') | owner |
| removeMember | workspaceId, userId | owner (any non-owner), admin (members only) |
| leaveWorkspace | workspaceId | non-owner |

Query: `getMembers(workspaceId)` with profile name, avatar, role, joined date.

## Invitations (features/invitations)
| Action | Input | Who | Notes |
|---|---|---|---|
| createInvitation | workspaceId, email, role | owner, admin | Generates 32-byte random token, stores SHA-256 hash, emails link `/invite/{token}` via Resend. `SEAT_LIMIT` if free plan full. `CONFLICT` if already member or pending. |
| revokeInvitation | invitationId | owner, admin | Sets revoked_at |
| resendInvitation | invitationId | owner, admin | Revoke + create new token |
| acceptInvitation | token | invited user (email must match) | Calls `accept_invitation` RPC, redirects to workspace |

Rate limit: max 20 invitations per workspace per hour. `createInvitation` counts rows in `invitations` for that workspace with `created_at` in the last hour (backed by `invitations_workspace_created_idx`, see database.md) and returns `RATE_LIMITED` at 20. No separate rate-limit table.

Page `/invite/[token]`: if not logged in, redirect to login/signup with `next` back to the invite. Show workspace name and role before accepting.

## Announcements (features/announcements)
| Action | Input | Who |
|---|---|---|
| createAnnouncement | workspaceId, title (1-120), body (1-5000) | owner, admin. Triggers push. |
| updateAnnouncement | id, title, body | owner, admin |
| deleteAnnouncement | id | owner, admin |

Query: `getAnnouncements(workspaceId, cursor?)` - 20 per page, cursor on `created_at`.

## Billing (features/billing)
| Action | Who | Returns |
|---|---|---|
| createCheckoutSession | owner | { url } Stripe Checkout (mode subscription, price = STRIPE_PRICE_PRO_MONTHLY, client_reference_id = workspaceId, metadata.workspace_id). Reuse stripe_customer_id if present. |
| createPortalSession | owner | { url } Stripe Customer Portal |

### POST /api/stripe/webhook
1. Read raw body, verify `stripe-signature` with STRIPE_WEBHOOK_SECRET. Invalid > 400.
2. Insert event.id into `stripe_events`. If it already exists > return 200 (already processed).
3. Handle (see ADR-009 — never trust event payload for subscription state, always re-fetch from Stripe):
   - `checkout.session.completed`: set stripe_customer_id, stripe_subscription_id on workspace from metadata, then fetch the subscription from the Stripe API and apply its status the same way as below.
   - `customer.subscription.updated`: fetch the subscription from the Stripe API; set subscription_status, current_period_end from the fetched object; plan = 'pro' if status in (active, trialing), else 'free'.
   - `customer.subscription.deleted`: plan = 'free', status = 'canceled'.
   - `invoice.payment_failed`: set subscription_status = 'past_due'.
4. On handler error: delete the stripe_events row, return 500 so Stripe retries.
5. Uses admin (service role) client. Runtime: nodejs.

## Push (features/push)
| Action | Input | Who |
|---|---|---|
| savePushSubscription | endpoint, keys.p256dh, keys.auth | logged-in user (upsert on endpoint) |
| deletePushSubscription | endpoint | owner of subscription |

Internal `sendAnnouncementPush(workspaceId, announcement, authorId)`:
- Load subscriptions of all workspace members except author (admin client, server only).
- Payload: `{ title, body (first 120 chars), url: /w/{slug} }`.
- `Promise.allSettled`, delete subscriptions returning 404 or 410.
- Push failures never fail the announcement action.

## Service worker (public/sw.js)
- `push` event: show notification with title, body, icon, data.url.
- `notificationclick`: focus existing tab or open data.url.
