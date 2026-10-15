import { notFound } from "next/navigation";
import { ManageBillingButton } from "@/features/billing/components/ManageBillingButton";
import { UpgradeButton } from "@/features/billing/components/UpgradeButton";
import { getBillingInfo } from "@/features/billing/queries";
import { getWorkspaceBySlug } from "@/features/workspaces/queries";

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { slug } = await params;
  const { status } = await searchParams;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    notFound();
  }

  const billing = await getBillingInfo(workspace.id);
  const isOwner = workspace.role === "owner";

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-6 px-5 py-6 sm:px-8">
      <h1 className="text-xl font-semibold">Billing</h1>

      {status === "success" && (
        <p role="status">Processing your upgrade - this can take a few seconds.</p>
      )}
      {status === "cancelled" && <p role="status">Checkout cancelled.</p>}

      <div className="flex flex-col gap-1">
        <p>
          Plan: <strong>{billing.plan === "pro" ? "Pro" : "Free"}</strong>
        </p>
        <p>
          Seats used: {billing.seatsUsed}
          {billing.plan === "free" ? " / 5" : ""}
        </p>
        {billing.subscriptionStatus && <p>Subscription status: {billing.subscriptionStatus}</p>}
        {billing.currentPeriodEnd && (
          <p>Renews: {new Date(billing.currentPeriodEnd).toLocaleDateString()}</p>
        )}
      </div>

      {isOwner ? (
        billing.hasStripeCustomer ? (
          <ManageBillingButton workspaceId={workspace.id} />
        ) : (
          <UpgradeButton workspaceId={workspace.id} />
        )
      ) : (
        <p>Only the workspace owner can manage billing.</p>
      )}
    </div>
  );
}
