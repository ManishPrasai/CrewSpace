import { WorkspaceCardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <WorkspaceCardSkeleton />
        <WorkspaceCardSkeleton />
      </div>
    </main>
  );
}
