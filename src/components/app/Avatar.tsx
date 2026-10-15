import { cn } from "cn"
import { monogramTint } from "@/lib/monogram-tint"

const SIZE_CLASSES: Record<number, string> = {
  24: "size-6 text-[10px]",
  30: "size-[30px] text-[11px]",
  32: "size-8 text-xs",
  40: "size-10 text-sm",
  48: "size-12 text-base",
  64: "size-16 text-lg",
};

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// handoff/03-components.md: initials or "?" for a null name, tint from a
// hash of id, dashed variant for pending/open seats.
export function Avatar({
  name,
  id,
  size = 32,
  pending = false,
  className,
}: {
  name?: string | null;
  id: string;
  size?: 24 | 30 | 32 | 40 | 48 | 64;
  pending?: boolean;
  className?: string;
}) {
  const tint = monogramTint(id);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
        SIZE_CLASSES[size],
        pending && "border border-dashed border-current bg-transparent",
        className,
      )}
      style={pending ? { color: tint.fg } : { backgroundColor: tint.bg, color: tint.fg }}
      aria-hidden="true"
    >
      {initials(name ?? null)}
    </span>
  );
}
