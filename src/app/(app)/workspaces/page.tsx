import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { BrandMark } from "@/components/app/BrandMark";
import { RoleBadge } from "@/components/app/RoleBadge";
import { WorkspaceMonogram } from "@/components/app/WorkspaceMonogram";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { getMyProfile } from "@/features/auth/queries";
import { CreateWorkspaceForm } from "@/features/workspaces/components/CreateWorkspaceForm";
import { getMyWorkspaces } from "@/features/workspaces/queries";

// handoff: W1/W2 (C v2 - Auth & Onboarding.dc.html) - a top bar (brand +
// account) and a white panel on the gray canvas, same chrome concept the
// rest of the app uses, scaled down for a route with no workspace
// context yet (so no sidebar/switcher - there's no current workspace to
// switch between).
export default async function WorkspacesPage() {
  const [workspaces, profile] = await Promise.all([getMyWorkspaces(), getMyProfile()]);
  const user = { name: profile?.fullName ?? null, email: profile?.email ?? null };
  const hasWorkspaces = workspaces.length > 0;

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex h-14 items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-2 font-semibold tracking-[-0.025em] text-foreground">
          <BrandMark variant="full" size={20} />
          Crewspace
        </div>
        <AccountMenu user={user} expanded />
      </header>

      <main className="mx-auto w-full max-w-[800px] px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-background p-6 shadow-raised sm:p-8">
          {hasWorkspaces ? (
            <>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-[26px] font-semibold tracking-[-0.03em]">Your workspaces</h1>
                <p className="text-[14.5px] text-muted-foreground">Choose a workspace, or create a new one.</p>
              </div>

              <ul className="mt-5 flex flex-col overflow-hidden rounded-xl border border-border-subtle">
                {workspaces.map((workspace) => (
                  <li key={workspace.id} className="border-b border-border-subtle last:border-b-0">
                    <Link
                      href={`/w/${workspace.slug}`}
                      className="flex items-center gap-3 p-4 outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    >
                      <WorkspaceMonogram name={workspace.name} slug={workspace.slug} size={40} />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-[15px] font-medium">{workspace.name}</span>
                        <span className="truncate font-mono text-[13px] text-muted-foreground">{workspace.slug}</span>
                      </div>
                      <div className="ml-auto flex shrink-0 items-center gap-2">
                        <RoleBadge role={workspace.role} />
                        <ChevronRightIcon className="size-4 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div id="create" className="mt-7 flex flex-col gap-3">
                <h2 className="text-[15px] font-semibold">Create a workspace</h2>
                <div className="rounded-xl border border-border-subtle p-5">
                  <CreateWorkspaceForm />
                </div>
              </div>
            </>
          ) : (
            <div className="mx-auto flex max-w-[440px] flex-col items-center gap-3 py-10 text-center">
              <BrandMark variant="full" size={40} className="opacity-80" />
              <h1 className="text-[24px] font-semibold tracking-[-0.025em]">Create your first workspace</h1>
              <p className="text-[14.5px] text-muted-foreground">
                You&rsquo;re not a member of any workspace yet. Create one, or open an invitation link from your
                email.
              </p>
              <div id="create" className="mt-3 w-full rounded-xl border border-border-subtle p-5 text-left">
                <CreateWorkspaceForm stacked />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
