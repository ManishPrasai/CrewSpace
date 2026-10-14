"use server";

import { err, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { deletePushSubscriptionSchema, savePushSubscriptionSchema } from "./schemas";

// Called directly from a client component (the push toggle), not bound
// to a <form> - a browser PushSubscription object isn't form data.
export async function savePushSubscription(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
): Promise<ActionResult<void>> {
  const parsed = savePushSubscriptionSchema.safeParse({
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid subscription", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return err("UNAUTHENTICATED", "Please log in.");
  }

  // Upsert-on-endpoint via delete-then-insert: push_subscriptions has no
  // UPDATE RLS policy (docs/database.md), so a real SQL upsert would be
  // rejected on conflict. A re-subscribe from the same browser normally
  // keeps the same endpoint+keys anyway, so this is a harmless no-op in
  // the common case and a correct replace when keys do change.
  await supabase.from("push_subscriptions").delete().eq("endpoint", parsed.data.endpoint);

  const { error } = await supabase.from("push_subscriptions").insert({
    user_id: user.id,
    endpoint: parsed.data.endpoint,
    p256dh: parsed.data.p256dh,
    auth: parsed.data.auth,
  });
  if (error) {
    console.error("savePushSubscription failed", error);
    return err("INTERNAL", "Could not save your subscription. Please try again.");
  }

  return ok();
}

export async function deletePushSubscription(endpoint: string): Promise<ActionResult<void>> {
  const parsed = deletePushSubscriptionSchema.safeParse({ endpoint });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input");
  }

  const supabase = await createClient();
  // RLS already scopes deletes to the caller's own rows - deleting an
  // endpoint that isn't theirs (or doesn't exist) is a harmless no-op,
  // the end state the client cares about (unsubscribed) is the same.
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", parsed.data.endpoint);
  if (error) {
    console.error("deletePushSubscription failed", error);
    return err("INTERNAL", "Could not remove your subscription. Please try again.");
  }

  return ok();
}
