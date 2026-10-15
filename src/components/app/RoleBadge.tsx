import { cn } from "cn"

const ROLE_CLASSES = {
  owner: "bg-brand-soft text-brand-ink",
  admin: "bg-muted text-foreground",
  member: "border border-input text-muted-foreground",
} as const;

// handoff/02-visual-design-spec.md: Owner brand-soft, Admin neutral fill,
// Member outline. No role badge appears on announcement posts (R06).
export function RoleBadge({
  role,
  className,
}: {
  role: "owner" | "admin" | "member";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        ROLE_CLASSES[role],
        className,
      )}
    >
      {role}
    </span>
  );
}
