import { cn } from "cn"

const TONE_CLASSES = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-muted text-muted-foreground",
} as const;

// handoff/02-visual-design-spec.md + 03-components.md: active (success),
// past_due/unpaid/incomplete (warning), canceled (neutral), unknown
// (neutral, raw text). trialing is treated as active's tier to match the
// webhook's own plan derivation (features/billing/webhook.ts: plan='pro'
// for status in active|trialing).
const STATUS_TONE: Record<string, "success" | "warning" | "neutral"> = {
  active: "success",
  trialing: "success",
  past_due: "warning",
  unpaid: "warning",
  incomplete: "warning",
  canceled: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Past due",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
  canceled: "Canceled",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  const label = STATUS_LABEL[status] ?? status;

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", TONE_CLASSES[tone], className)}
    >
      {label}
    </span>
  );
}
