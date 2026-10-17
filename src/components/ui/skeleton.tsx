import { cn } from "cn"

// handoff/03-components.md: matches the final layout (no CLS). The pulse
// itself is disabled by globals.css's prefers-reduced-motion block.
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

function PostSkeleton() {
  return (
    <div className="flex flex-col gap-2 border-b border-border-subtle py-4">
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-3.5 w-28" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-16 w-full" />
    </div>
  )
}

function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border-subtle py-3">
      <Skeleton className="size-8 rounded-full" />
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="ml-auto h-5 w-16 rounded-full" />
    </div>
  )
}

function WorkspaceCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-subtle p-4">
      <Skeleton className="size-10 rounded-md" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="ml-auto h-5 w-14 rounded-full" />
    </div>
  )
}

function PlanCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-6">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  )
}

export { Skeleton, PostSkeleton, MemberRowSkeleton, WorkspaceCardSkeleton, PlanCardSkeleton }
