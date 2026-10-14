import { createClient } from "@/lib/supabase/server";

export type BillingInfo = {
  plan: "free" | "pro";
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  seatsUsed: number;
  hasStripeCustomer: boolean;
};

export async function getBillingInfo(workspaceId: string): Promise<BillingInfo> {
  const supabase = await createClient();

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("plan, subscription_status, current_period_end, stripe_customer_id")
    .eq("id", workspaceId)
    .single();
  if (error) {
    throw error;
  }

  const { data: seatsUsed, error: seatsError } = await supabase.rpc("workspace_seat_count", {
    ws: workspaceId,
  });
  if (seatsError) {
    throw seatsError;
  }

  return {
    plan: workspace.plan,
    subscriptionStatus: workspace.subscription_status,
    currentPeriodEnd: workspace.current_period_end,
    seatsUsed: seatsUsed ?? 0,
    hasStripeCustomer: workspace.stripe_customer_id !== null,
  };
}
