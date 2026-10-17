import { cn } from "cn"

// handoff/03-components.md: 52px bar, breadcrumb left, contextual items
// right. Each page renders its own - see the layout for why this isn't
// a shared layout slot (Next.js layouts can't easily take per-page props).
export function PanelHeader({
  breadcrumb,
  actions,
  className,
}: {
  breadcrumb: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-border-subtle pl-6 pr-5", className)}>
      <div className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[13.5px] whitespace-nowrap text-muted-foreground">
        {breadcrumb}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
