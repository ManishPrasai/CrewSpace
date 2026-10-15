import { cn } from "cn"
import { monogramTint } from "@/lib/monogram-tint"

const SIZE_CLASSES: Record<number, string> = {
  24: "size-6 text-[10px] rounded-[6px]",
  32: "size-8 text-xs rounded-md",
  40: "size-10 text-sm rounded-md",
  48: "size-12 text-base rounded-lg",
};

// handoff/03-components.md: the workspace initial on one of six tints,
// hashed from the slug (stable even if the name changes).
export function WorkspaceMonogram({
  name,
  slug,
  size = 32,
  className,
}: {
  name: string;
  slug: string;
  size?: 24 | 32 | 40 | 48;
  className?: string;
}) {
  const tint = monogramTint(slug);

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center font-semibold", SIZE_CLASSES[size], className)}
      style={{ backgroundColor: tint.bg, color: tint.fg }}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
