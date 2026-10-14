import { notFound } from "next/navigation";
import { DeleteWorkspaceForm } from "@/features/workspaces/components/DeleteWorkspaceForm";
import { RenameWorkspaceForm } from "@/features/workspaces/components/RenameWorkspaceForm";
import { getWorkspaceBySlug } from "@/features/workspaces/queries";

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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      {canRename ? (
        <RenameWorkspaceForm workspaceId={workspace.id} name={workspace.name} />
      ) : (
        <p>Only the owner or an admin can change workspace settings.</p>
      )}

      {isOwner && (
        <div className="flex flex-col gap-2 border-t pt-6">
          <h2 className="text-lg font-semibold text-destructive">Danger zone</h2>
          <DeleteWorkspaceForm
            workspaceId={workspace.id}
            slug={workspace.slug}
            canDelete={workspace.plan === "free"}
          />
        </div>
      )}
    </div>
  );
}
