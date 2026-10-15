import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLinkButton } from "@/components/app/CopyLinkButton";
import { PanelHeader } from "@/components/app/PanelHeader";
import { RoleBadge } from "@/components/app/RoleBadge";
import { WorkspaceMonogram } from "@/components/app/WorkspaceMonogram";
import { getMyProfile } from "@/features/auth/queries";
import { UpdateProfileForm } from "@/features/auth/components/UpdateProfileForm";
import { IosInstallHint } from "@/features/push/components/IosInstallHint";
import { PushToggle } from "@/features/push/components/PushToggle";
import { DeleteWorkspaceForm } from "@/features/workspaces/components/DeleteWorkspaceForm";
import { RenameWorkspaceForm } from "@/features/workspaces/components/RenameWorkspaceForm";
import { getWorkspaceBySlug } from "@/features/workspaces/queries";

const ACCESS_COPY: Record<"owner" | "admin" | "member", string> = {
  owner: "You can change roles, manage billing and delete this workspace. Admins can rename it; members see these settings read-only.",
  admin: "You can rename this workspace and manage members. Only the owner can change roles, manage billing or delete it.",
  member: "You can view this workspace's settings. Only the owner and admins can make changes.",
};

// handoff/04-routes.md: a sub-nav with "Workspace" (General/Members/
// Billing) and "Your account" (Profile/Password). Members and Billing
// just link to their existing pages - General and "Your account" are
// the only real content on this route, so the "sub-nav" is anchor
// links into one scrollable page, not separate routes.
export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    notFound();
  }

  const canRename = workspace.role === "owner" || workspace.role === "admin";
  const isOwner = workspace.role === "owner";
  const profile = await getMyProfile();

  return (
    <div className="flex flex-col">
      <PanelHeader
        breadcrumb={
          <>
            {workspace.name}
            <span className="px-1.5 text-border-subtle">/</span>
            <span className="font-medium text-foreground">Settings</span>
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-[920px] gap-12 px-5 pt-7 pb-10 sm:px-8">
        <nav className="flex w-[180px] shrink-0 flex-col gap-5 text-[14px]">
          <div className="flex flex-col gap-0.5">
            <span className="px-2.5 pb-1.5 text-[12px] font-medium text-muted-foreground">Workspace</span>
            <a href="#general" className="rounded-md bg-muted px-2.5 py-1.5 font-medium">
              General
            </a>
            <Link href={`/w/${slug}/members`} className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted">
              Members
            </Link>
            <Link href={`/w/${slug}/billing`} className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted">
              Billing
            </Link>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="px-2.5 pb-1.5 text-[12px] font-medium text-muted-foreground">Your account</span>
            <a href="#account" className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted">
              Profile
            </a>
            <a href="#account" className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted">
              Password
            </a>
          </div>
          <p className="px-2.5 text-[12.5px] leading-snug text-muted-foreground">
            Account settings apply to you in every workspace.
          </p>
        </nav>

        <div id="general" className="flex min-w-0 flex-1 flex-col gap-7">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[26px] font-semibold tracking-[-0.03em]">General</h1>
            <p className="text-[14.5px] text-muted-foreground">How {workspace.name} appears to its members.</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="text-[15px] font-semibold">Workspace identity</h2>
            <div className="rounded-xl border border-border-subtle">
              {canRename ? (
                <RenameWorkspaceForm workspaceId={workspace.id} name={workspace.name} />
              ) : (
                <div className="grid grid-cols-[180px_minmax(0,1fr)] items-center gap-5 border-b border-border-subtle p-4">
                  <span className="text-[14px] font-medium">Name</span>
                  <span className="text-[14px]">{workspace.name}</span>
                </div>
              )}
              <div className="grid grid-cols-[180px_minmax(0,1fr)] items-center gap-5 border-b border-border-subtle p-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium">URL</span>
                  <span className="text-[12.5px] text-muted-foreground">Set when the workspace was created</span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-muted/60 px-3 py-2">
                  <span className="truncate font-mono text-[13px] text-muted-foreground">
                    crewspace.app/w/<span className="text-foreground">{slug}</span>
                  </span>
                  <CopyLinkButton path={`/w/${slug}`} />
                </div>
              </div>
              <div className="grid grid-cols-[180px_minmax(0,1fr)] items-center gap-5 p-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium">Monogram</span>
                  <span className="text-[12.5px] text-muted-foreground">Generated from the name</span>
                </div>
                <div className="flex items-center gap-3">
                  <WorkspaceMonogram name={workspace.name} slug={slug} size={40} />
                  <span className="text-[13px] text-muted-foreground">
                    Shown in the sidebar, the workspace switcher and invitation emails.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="text-[15px] font-semibold">Your access</h2>
            <div className="flex items-center gap-3.5 rounded-xl border border-border-subtle p-4">
              <RoleBadge role={workspace.role} />
              <p className="flex-1 text-[13.5px] text-muted-foreground">{ACCESS_COPY[workspace.role]}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border-subtle pt-6">
            <h2 className="text-[15px] font-semibold">Notifications</h2>
            <p className="text-[13.5px] text-muted-foreground">
              Get notified on this device when any of your workspaces posts a new announcement.
            </p>
            <IosInstallHint />
            <PushToggle />
          </div>

          {isOwner && (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-[15px] font-semibold text-destructive">Danger zone</h2>
              <DeleteWorkspaceForm
                workspaceId={workspace.id}
                slug={workspace.slug}
                canDelete={workspace.plan === "free"}
              />
            </div>
          )}

          <div id="account" className="flex flex-col gap-2.5 border-t border-border-subtle pt-6">
            <h2 className="text-[15px] font-semibold">Your account</h2>
            <div className="rounded-xl border border-border-subtle">
              <UpdateProfileForm fullName={profile?.fullName ?? ""} slug={slug} />
              <div className="grid grid-cols-[180px_minmax(0,1fr)] items-center gap-5 p-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium">Password</span>
                  <span className="text-[12.5px] text-muted-foreground">{profile?.email}</span>
                </div>
                <Link
                  href="/reset-password/update"
                  className="w-fit rounded-md border border-input px-3 py-1.5 text-[13.5px] font-medium hover:bg-muted"
                >
                  Change password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
