"use server";

import { redirect } from "next/navigation";
import { clientEnv, serverEnv } from "@/lib/env";
import { err, type ActionResult } from "@/lib/result";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSessionSchema, createPortalSessionSchema } from "./schemas";

// Billing is owner-only (docs/requirements.md): admins can manage members
// and announcements but not billing. Checkout/Portal calls aren't gated
// by any RLS-protected table write, so the role check has to happen here
// explicitly rather than relying on the database to reject it.
async function requireOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
): Promise<boolean> {
  const { data } = await supabase.rpc("has_workspace_role", {
    ws: workspaceId,
    roles: ["owner"],
  });
  return data === true;
}

export async function createCheckoutSession(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = createCheckoutSessionSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  if (!(await requireOwner(supabase, parsed.data.workspaceId))) {
    return err("FORBIDDEN", "Only the workspace owner can manage billing.");
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("slug, stripe_customer_id")
    .eq("id", parsed.data.workspaceId)
    .single();
  if (error || !workspace) {
    return err("NOT_FOUND", "Workspace not found.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: serverEnv.STRIPE_PRICE_PRO_MONTHLY, quantity: 1 }],
    client_reference_id: parsed.data.workspaceId,
    metadata: { workspace_id: parsed.data.workspaceId },
    customer: workspace.stripe_customer_id ?? undefined,
    success_url: `${clientEnv.NEXT_PUBLIC_APP_URL}/w/${workspace.slug}/billing?status=success`,
    cancel_url: `${clientEnv.NEXT_PUBLIC_APP_URL}/w/${workspace.slug}/billing?status=cancelled`,
  });

  if (!session.url) {
    return err("INTERNAL", "Could not start checkout. Please try again.");
  }
  redirect(session.url);
}

export async function createPortalSession(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = createPortalSessionSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  if (!(await requireOwner(supabase, parsed.data.workspaceId))) {
    return err("FORBIDDEN", "Only the workspace owner can manage billing.");
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("slug, stripe_customer_id")
    .eq("id", parsed.data.workspaceId)
    .single();
  if (error || !workspace || !workspace.stripe_customer_id) {
    return err("NOT_FOUND", "No billing account found for this workspace yet.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripe_customer_id,
    return_url: `${clientEnv.NEXT_PUBLIC_APP_URL}/w/${workspace.slug}/billing`,
  });

  redirect(session.url);
}
