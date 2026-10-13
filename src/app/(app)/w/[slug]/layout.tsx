import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceSwitcher } from "@/features/workspaces/components/WorkspaceSwitcher";
import { getMyWorkspaces, getWorkspaceBySlug } from "@/features/workspaces/queries";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // The actual authorization gate: middleware only checks "is there a
  // session", not "is this user a member of this specific workspace".
  // getWorkspaceBySlug returns null for both "doesn't exist" and "exists
  // but I'm not a member" - RLS makes those indistinguishable on purpose.
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    notFound();
  }

  const workspaces = await getMyWorkspaces();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <WorkspaceSwitcher current={workspace} workspaces={workspaces} />
        <nav className="flex items-center gap-3">
          <Link href={`/w/${workspace.slug}/members`}>Members</Link>
          <Link href={`/w/${workspace.slug}/settings`}>Settings</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
