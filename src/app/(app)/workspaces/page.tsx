import Link from "next/link";
import { CreateWorkspaceForm } from "@/features/workspaces/components/CreateWorkspaceForm";
import { getMyWorkspaces } from "@/features/workspaces/queries";

export default async function WorkspacesPage() {
  const workspaces = await getMyWorkspaces();

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Your workspaces</h1>

      {workspaces.length === 0 ? (
        <p>You&apos;re not a member of any workspace yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <Link href={`/w/${workspace.slug}`}>{workspace.name}</Link>
            </li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Create a workspace</h2>
        <CreateWorkspaceForm />
      </section>
    </main>
  );
}
