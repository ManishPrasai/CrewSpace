import { getWorkspaceBySlug } from "@/features/workspaces/queries";

// Placeholder: the real announcements feed is a Day 5 task. This just
// proves the layout's 404-if-not-member gate and the route itself work.
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);

  return (
    <div>
      <h1 className="text-xl font-semibold">{workspace?.name}</h1>
      <p>Announcements feed coming soon.</p>
    </div>
  );
}
