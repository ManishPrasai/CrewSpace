import { notFound } from "next/navigation";
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      {canRename ? (
        <RenameWorkspaceForm workspaceId={workspace.id} name={workspace.name} />
      ) : (
        <p>Only the owner or an admin can change workspace settings.</p>
      )}
    </div>
  );
}
