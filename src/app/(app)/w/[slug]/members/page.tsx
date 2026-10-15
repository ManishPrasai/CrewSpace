import { notFound } from "next/navigation";
import { InvitationRow } from "@/features/invitations/components/InvitationRow";
import { InviteMemberForm } from "@/features/invitations/components/InviteMemberForm";
import { getInvitations } from "@/features/invitations/queries";
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

  const canInvite = workspace.role === "owner" || workspace.role === "admin";

  const members = await getMembers(workspace.id);
  const invitations = canInvite ? await getInvitations(workspace.id) : [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-6 px-5 py-6 sm:px-8">
      <div>
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

      {canInvite && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Pending invitations</h2>
          {invitations.length === 0 ? (
            <p>No pending invitations.</p>
          ) : (
            <ul>
              {invitations.map((invitation) => (
                <InvitationRow key={invitation.id} invitation={invitation} slug={slug} />
              ))}
            </ul>
          )}

          <h2 className="text-lg font-semibold">Invite someone</h2>
          <InviteMemberForm workspaceId={workspace.id} slug={slug} />
        </div>
      )}
    </div>
  );
}
