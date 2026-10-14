import { notFound } from "next/navigation";
import { AnnouncementFeed } from "@/features/announcements/components/AnnouncementFeed";
import { AnnouncementForm } from "@/features/announcements/components/AnnouncementForm";
import { getAnnouncements } from "@/features/announcements/queries";
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
  const { items, nextCursor } = await getAnnouncements(workspace.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{workspace.name}</h1>

      {canManage && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Post an announcement</h2>
          <AnnouncementForm workspaceId={workspace.id} slug={slug} />
        </div>
      )}

      <AnnouncementFeed
        workspaceId={workspace.id}
        slug={slug}
        canManage={canManage}
        initialItems={items}
        initialCursor={nextCursor}
      />
    </div>
  );
}
