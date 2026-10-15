import Link from "next/link";
import { notFound } from "next/navigation";
import { AvatarStack } from "@/components/app/AvatarStack";
import { PanelHeader } from "@/components/app/PanelHeader";
import { AnnouncementComposer } from "@/features/announcements/components/AnnouncementComposer";
import { AnnouncementFeed } from "@/features/announcements/components/AnnouncementFeed";
import { getAnnouncements } from "@/features/announcements/queries";
import { getMyProfile } from "@/features/auth/queries";
import { getMembers } from "@/features/members/queries";
import { getWorkspaceBySlug } from "@/features/workspaces/queries";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    notFound();
  }

  const canManage = workspace.role === "owner" || workspace.role === "admin";

  const [{ items, nextCursor }, members, profile] = await Promise.all([
    getAnnouncements(workspace.id),
    getMembers(workspace.id),
    canManage ? getMyProfile() : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col">
      <PanelHeader
        breadcrumb={
          <>
            {workspace.name}
            <span className="px-1.5 text-border-subtle">/</span>
            <span className="font-medium text-foreground">Announcements</span>
          </>
        }
        actions={
          <Link
            href={`/w/${slug}/members`}
            className="flex items-center gap-2 rounded-full border border-border-subtle px-2.5 py-1 hover:bg-muted"
          >
            <AvatarStack people={members.map((m) => ({ id: m.userId, name: m.fullName }))} max={4} />
            <span className="text-[12.5px] text-muted-foreground">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </Link>
        }
      />

      <div className="mx-auto flex w-full max-w-[760px] flex-col px-5 pt-7 pb-6 sm:px-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-semibold tracking-[-0.03em]">Announcements</h1>
          <p className="text-[14.5px] text-muted-foreground">
            {canManage
              ? `Official updates for everyone in ${workspace.name}.`
              : `Official updates from the owners and admins of ${workspace.name}.`}
          </p>
        </div>

        {canManage && (
          <div className="mt-6">
            <AnnouncementComposer
              workspaceId={workspace.id}
              slug={slug}
              workspaceName={workspace.name}
              authorId={profile?.email ?? "me"}
              authorName={profile?.fullName ?? null}
            />
          </div>
        )}

        <AnnouncementFeed
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          slug={slug}
          canManage={canManage}
          initialItems={items}
          initialCursor={nextCursor}
        />
      </div>
    </div>
  );
}
