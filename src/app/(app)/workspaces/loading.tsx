import { Skeleton, WorkspaceCardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="flex h-14 items-center justify-between px-6 sm:px-10">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="size-8 rounded-full" />
      </div>
      <main className="mx-auto w-full max-w-[800px] px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-background p-6 shadow-raised sm:p-8">
          <div className="flex flex-col gap-2">
            <WorkspaceCardSkeleton />
            <WorkspaceCardSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
