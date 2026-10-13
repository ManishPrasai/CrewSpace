import { notFound } from "next/navigation";
import { MemberRow } from "@/features/members/components/MemberRow";
import { getMembers } from "@/features/members/queries";
import { getWorkspaceBySlug } from "@/features/workspaces/queries";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    notFound();
  }

  const members = await getMembers(workspace.id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Members</h1>
      <ul>
        {members.map((member) => (
          <MemberRow
            key={member.userId}
            member={member}
            workspaceId={workspace.id}
            slug={slug}
            viewerRole={workspace.role}
            viewerUserId={user?.id ?? ""}
          />
        ))}
      </ul>
    </div>
  );
}
