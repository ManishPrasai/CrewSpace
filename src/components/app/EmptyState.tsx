import { BrandMark } from "./BrandMark"

// handoff/02-visual-design-spec.md (motif discipline): empty states are
// composed per page, never a generic dashed box - dashed means "not yet
// a member" and nothing else.
export function EmptyState({
  variant,
  title,
  description,
}: {
  variant: "feedFirstPost" | "inlineRow" | "line";
  title?: string;
  description: string;
}) {
  if (variant === "feedFirstPost") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <BrandMark variant="leaf" size={28} className="opacity-40" />
        {title && <p className="text-[15px] font-medium text-foreground">{title}</p>}
        <p className="max-w-[34em] text-[15.5px] text-muted-foreground">{description}</p>
      </div>
    );
  }

  if (variant === "inlineRow") {
    return (
      <div className="flex items-center gap-2 border-b border-border-subtle py-3 text-[14px] text-muted-foreground">
        {description}
      </div>
    );
  }

  return <p className="text-[13.5px] text-muted-foreground">{description}</p>;
}
