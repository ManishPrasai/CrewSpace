import { notFound } from "next/navigation";
import { Loader2Icon, XIcon } from "lucide-react";
import { PanelHeader } from "@/components/app/PanelHeader";
import { PlanCard } from "@/features/billing/components/PlanCard";
import { PlanCompare } from "@/features/billing/components/PlanCompare";
import { getBillingInfo } from "@/features/billing/queries";
import { getMembers } from "@/features/members/queries";
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

  const isOwner = workspace.role === "owner";
  const [billing, members] = await Promise.all([getBillingInfo(workspace.id), getMembers(workspace.id)]);
  const owner = members.find((m) => m.role === "owner");

  return (
    <div className="flex flex-col">
      <PanelHeader
        breadcrumb={
          <>
            {workspace.name}
            <span className="px-1.5 text-border-subtle">/</span>
            <span className="font-medium text-foreground">Billing</span>
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-8 px-5 pt-7 pb-10 sm:px-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-semibold tracking-[-0.03em]">Billing</h1>
          <p className="text-[14.5px] text-muted-foreground">
            Plan and seats for {workspace.name}. Only the owner can change the subscription.
          </p>
        </div>

        {status === "success" && (
          <div role="status" className="flex items-center gap-2.5 rounded-xl bg-brand-soft px-4 py-3 text-[13.5px] text-brand-ink">
            <Loader2Icon className="size-4 shrink-0 animate-spin" />
            Processing your upgrade. This can take a few seconds.
          </div>
        )}
        {status === "cancelled" && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl bg-foreground px-4 py-3 text-[13.5px] text-background"
          >
            <span className="flex-1">Checkout cancelled. You&rsquo;re still on the Free plan.</span>
            <XIcon className="size-3.5 shrink-0 text-background/50" />
          </div>
        )}

        <PlanCard
          workspaceId={workspace.id}
          billing={billing}
          ownerName={owner?.fullName ?? "the owner"}
          members={members.map((m) => ({ id: m.userId, name: m.fullName }))}
          isOwner={isOwner}
        />

        {isOwner && billing.plan === "free" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold">Plans</h2>
            <PlanCompare />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold">Billing details</h2>
          <div className="flex flex-col rounded-xl border border-border-subtle text-[14px]">
            <div className="grid grid-cols-[200px_minmax(0,1fr)] border-b border-border-subtle p-4">
              <span className="text-muted-foreground">Managed by</span>
              <span>
                {owner?.fullName ?? "Unnamed"} <span className="text-muted-foreground">(owner)</span>
              </span>
            </div>
            <div className="grid grid-cols-[200px_minmax(0,1fr)] p-4">
              <span className="text-muted-foreground">Payment and invoices</span>
              <span className="text-muted-foreground">
                {billing.hasStripeCustomer
                  ? "Available in the Stripe billing portal."
                  : "Available in the Stripe billing portal after upgrading."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
