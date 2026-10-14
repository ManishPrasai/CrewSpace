import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUniqueViolation } from "@/lib/errors";
import { stripe } from "@/lib/stripe";

type AdminClient = ReturnType<typeof createAdminClient>;

// ADR-009: never trust a webhook payload for plan/status fields. Always
// re-fetch the subscription from the Stripe API and derive state from
// that, so the result doesn't depend on event delivery order.
async function syncSubscription(
  admin: AdminClient,
  workspaceId: string,
  subscriptionId: string,
): Promise<void> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await applySubscriptionState(admin, workspaceId, subscription);
}

async function applySubscriptionState(
  admin: AdminClient,
  workspaceId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const plan = subscription.status === "active" || subscription.status === "trialing" ? "pro" : "free";
  // current_period_end lives on the subscription item, not the
  // subscription itself, as of this Stripe API version.
  const periodEndSeconds = subscription.items.data[0]?.current_period_end;

  const { error } = await admin
    .from("workspaces")
    .update({
      plan,
      subscription_status: subscription.status,
      current_period_end: periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : null,
    })
    .eq("id", workspaceId);
  if (error) {
    throw error;
  }
}

async function findWorkspaceBySubscription(
  admin: AdminClient,
  subscriptionId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("workspaces")
    .select("id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data?.id ?? null;
}

async function handleCheckoutSessionCompleted(
  admin: AdminClient,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const workspaceId = session.metadata?.workspace_id ?? session.client_reference_id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (!workspaceId || !customerId || !subscriptionId) {
    return;
  }

  const { error } = await admin
    .from("workspaces")
    .update({ stripe_customer_id: customerId, stripe_subscription_id: subscriptionId })
    .eq("id", workspaceId);
  if (error) {
    throw error;
  }

  await syncSubscription(admin, workspaceId, subscriptionId);
}

async function handleSubscriptionUpdated(
  admin: AdminClient,
  subscription: Stripe.Subscription,
): Promise<void> {
  const workspaceId = await findWorkspaceBySubscription(admin, subscription.id);
  if (!workspaceId) {
    return;
  }
  await syncSubscription(admin, workspaceId, subscription.id);
}

async function handleSubscriptionDeleted(
  admin: AdminClient,
  subscription: Stripe.Subscription,
): Promise<void> {
  const workspaceId = await findWorkspaceBySubscription(admin, subscription.id);
  if (!workspaceId) {
    return;
  }
  const { error } = await admin
    .from("workspaces")
    .update({ plan: "free", subscription_status: "canceled" })
    .eq("id", workspaceId);
  if (error) {
    throw error;
  }
}

async function handleInvoicePaymentFailed(admin: AdminClient, invoice: Stripe.Invoice): Promise<void> {
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
  if (!subscriptionId) {
    return;
  }
  const workspaceId = await findWorkspaceBySubscription(admin, subscriptionId);
  if (!workspaceId) {
    return;
  }
  const { error } = await admin
    .from("workspaces")
    .update({ subscription_status: "past_due" })
    .eq("id", workspaceId);
  if (error) {
    throw error;
  }
}

async function dispatch(admin: AdminClient, event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(admin, event.data.object);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(admin, event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(admin, event.data.object);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(admin, event.data.object);
      break;
    default:
      break;
  }
}

// Idempotency (docs/api.md): insert the event id first: a unique-violation
// means it's already been processed, so return without re-running the
// handler. If the handler itself throws, delete the row so Stripe's retry
// gets a clean slate rather than being silently treated as already-done.
export async function processStripeEvent(event: Stripe.Event): Promise<void> {
  const admin = createAdminClient();

  const { error: insertError } = await admin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (insertError) {
    if (isUniqueViolation(insertError)) {
      return;
    }
    throw insertError;
  }

  try {
    await dispatch(admin, event);
  } catch (handlerError) {
    await admin.from("stripe_events").delete().eq("id", event.id);
    throw handlerError;
  }
}
