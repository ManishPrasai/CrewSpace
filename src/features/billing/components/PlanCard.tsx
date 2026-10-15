import { CircleUserIcon } from "lucide-react";
import { AvatarStack } from "@/components/app/AvatarStack";
import { StatusBadge } from "@/components/app/StatusBadge";
import { ManageBillingButton } from "./ManageBillingButton";
import { UpgradeButton } from "./UpgradeButton";
import type { BillingInfo } from "../queries";

// handoff/03-components.md: PlanCard - plan, seatsUsed, status,
// periodEnd, isOwner, hasStripeCustomer. States per D5/D6/S14: Free
// (seat grid + upsell footer), Pro active (renewal date, no seat
// limit, Manage billing), Pro past_due (warning copy, "Update payment"
// - ManageBillingButton relabelled, not a second action), and a
// non-owner viewer (no button, just who to ask).
export function PlanCard({
  workspaceId,
  billing,
  ownerName,
  members,
  isOwner,
}: {
  workspaceId: string;
  billing: BillingInfo;
  ownerName: string;
  members: { id: string; name: string | null }[];
  isOwner: boolean;
}) {
  const isPastDue = billing.subscriptionStatus === "past_due";
  const openSeats = Math.max(0, 5 - billing.seatsUsed);
  const pendingCount = Math.max(0, billing.seatsUsed - members.length);

  return (
    <div className="rounded-[20px] border border-border-subtle bg-background p-2 shadow-raised">
      <div className="rounded-[13px] border border-border-subtle bg-muted/60 p-6">
        {billing.plan === "free" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-muted-foreground">Current plan</span>
              <span className="text-[44px] font-semibold leading-none tracking-[-0.05em] sm:text-[52px]">
                Free
              </span>
              <span className="text-[14px] text-muted-foreground">
                Up to 5 members. Every Crewspace feature included.
              </span>
            </div>
            <div className="flex flex-col gap-3 border-t border-border-subtle pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
              <span className="text-[13px] font-medium text-muted-foreground">Seats</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[44px] font-semibold leading-none tracking-[-0.05em] sm:text-[52px]">
                  {billing.seatsUsed}
                </span>
                <span className="text-[16px] text-muted-foreground">of 5 used</span>
              </div>
              <div className="flex items-center gap-3">
                <AvatarStack people={members.map((m) => ({ id: m.id, name: m.name }))} max={4} openSeats={openSeats} />
                <span className="text-[13px] text-muted-foreground">
                  {openSeats} seat{openSeats === 1 ? "" : "s"} left
                  {pendingCount > 0 ? ` · ${pendingCount} invitation${pendingCount === 1 ? "" : "s"} pending` : ""}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-muted-foreground">Current plan</span>
              <div className="flex items-center gap-2.5">
                <span className="text-[40px] font-semibold leading-none tracking-[-0.05em]">Pro</span>
                <StatusBadge status={billing.subscriptionStatus ?? "active"} />
              </div>
              <span className="text-[13.5px] text-muted-foreground">
                {isPastDue
                  ? "Stripe couldn't take the last payment. Update your card in the billing portal."
                  : billing.currentPeriodEnd
                    ? `Renews on ${new Date(billing.currentPeriodEnd).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}`
                    : "Renews automatically each month."}
              </span>
            </div>
            {!isPastDue && (
              <div className="flex flex-col gap-2 border-t border-border-subtle pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
                <span className="text-[13px] font-medium text-muted-foreground">Seats</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[40px] font-semibold leading-none tracking-[-0.05em]">
                    {billing.seatsUsed}
                  </span>
                  <span className="text-[14px] text-muted-foreground">members</span>
                </div>
                <span className="text-[13.5px] text-muted-foreground">No member limit on Pro</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        {isOwner ? (
          billing.plan === "free" ? (
            <>
              <span className="text-[13.5px] text-muted-foreground">
                To add a sixth member, upgrade to Pro. Checkout happens on Stripe and returns you here.
              </span>
              <UpgradeButton workspaceId={workspaceId} />
            </>
          ) : (
            <>
              <span className="text-[13px] text-muted-foreground">
                {isPastDue
                  ? ""
                  : billing.hasStripeCustomer
                    ? "Update your card, download invoices or cancel in Stripe."
                    : ""}
              </span>
              <ManageBillingButton workspaceId={workspaceId} urgent={isPastDue} />
            </>
          )
        ) : (
          <span className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
            <CircleUserIcon className="size-4 shrink-0" />
            Only the workspace owner, {ownerName}, can manage billing.
          </span>
        )}
      </div>
    </div>
  );
}
