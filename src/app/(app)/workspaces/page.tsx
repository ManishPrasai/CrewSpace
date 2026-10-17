import Link from "next/link";
import { EmptyState } from "@/components/app/EmptyState";
import { RoleBadge } from "@/components/app/RoleBadge";
import { WorkspaceMonogram } from "@/components/app/WorkspaceMonogram";
import { CreateWorkspaceForm } from "@/features/workspaces/components/CreateWorkspaceForm";
import { getMyWorkspaces } from "@/features/workspaces/queries";

export default async function WorkspacesPage() {
  const workspaces = await getMyWorkspaces();

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8 p-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-semibold">Your workspaces</h1>
        <p className="text-[13.5px] text-muted-foreground">Choose a workspace, or create a new one.</p>
      </div>

      {workspaces.length === 0 ? (
        <EmptyState variant="line" description="You're not a member of any workspace yet." />
      ) : (
        <ul className="flex flex-col gap-2">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <Link
                href={`/w/${workspace.slug}`}
                className="flex items-center gap-3 rounded-xl border border-border-subtle p-4 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <WorkspaceMonogram name={workspace.name} slug={workspace.slug} size={40} />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] font-medium">{workspace.name}</span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    crewspace.app/w/{workspace.slug}
                  </span>
                </div>
                <RoleBadge role={workspace.role} className="ml-auto" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-3 border-t border-border-subtle pt-6">
        <h2 className="text-[14px] font-medium text-muted-foreground">Create a workspace</h2>
        <CreateWorkspaceForm />
      </section>
    </main>
  );
}
