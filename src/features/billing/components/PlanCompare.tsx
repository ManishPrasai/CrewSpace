import { CheckIcon } from "lucide-react";

const CHECK = <CheckIcon className="size-3.5 shrink-0" />;

// handoff/03-components.md PlanCompare. Only ever rendered for an owner
// still on Free (see billing/page.tsx) - there's nothing to upsell a
// Pro workspace into, so the "which card gets the dark accent" question
// the design's own self-review flagged (D7: "the dark Pro card...
// should switch to the light style once you're subscribed") never
// comes up here; Free is always current, Pro is always the upsell.
export function PlanCompare() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-3.5 rounded-2xl border border-border-subtle p-5">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-semibold">Free</span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Current plan
          </span>
        </div>
        <span className="text-[14px] text-muted-foreground">For teams of up to five.</span>
        <div className="flex flex-col gap-2 border-t border-border-subtle pt-3.5 text-[14px]">
          <span className="flex items-center gap-2.5">{CHECK} Up to 5 members</span>
          <span className="flex items-center gap-2.5">{CHECK} Announcements, invitations and roles</span>
        </div>
      </div>
      <div className="flex flex-col gap-3.5 rounded-2xl bg-foreground p-5 text-background">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-semibold">Pro</span>
          <span className="rounded-full bg-background/15 px-2.5 py-0.5 text-xs font-medium text-brand">
            Billed monthly
          </span>
        </div>
        <span className="text-[14px] text-background/60">For teams of more than five.</span>
        <div className="flex flex-col gap-2 border-t border-background/15 pt-3.5 text-[14px]">
          <span className="flex items-center gap-2.5 text-background/90">
            <span className="text-brand">{CHECK}</span>More than 5 members
          </span>
          <span className="flex items-center gap-2.5 text-background/90">
            <span className="text-brand">{CHECK}</span>Invoices and cancellation in Stripe&rsquo;s portal
          </span>
        </div>
      </div>
    </div>
  );
}
