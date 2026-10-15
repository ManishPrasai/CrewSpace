import Link from "next/link";
import { notFound } from "next/navigation";
import { AvatarStack } from "@/components/app/AvatarStack";
import { PanelHeader } from "@/components/app/PanelHeader";
import { getBillingInfo } from "@/features/billing/queries";
import { InvitationRow } from "@/features/invitations/components/InvitationRow";
import { InviteDialog } from "@/features/invitations/components/InviteDialog";
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

  const [members, invitations, billing, { data: userData }] = await Promise.all([
    getMembers(workspace.id),
    canInvite ? getInvitations(workspace.id) : Promise.resolve([]),
    getBillingInfo(workspace.id),
    (await createClient()).auth.getUser(),
  ]);
  const viewerUserId = userData.user?.id ?? "";

  return (
    <div className="flex flex-col">
      <PanelHeader
        breadcrumb={
          <>
            {workspace.name}
            <span className="px-1.5 text-border-subtle">/</span>
            <span className="font-medium text-foreground">Members</span>
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-7 px-5 pt-7 pb-10 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[26px] font-semibold tracking-[-0.03em]">Members</h1>
            <p className="text-[14.5px] text-muted-foreground">
              People with access to {workspace.name} and their roles.
            </p>
          </div>
          {canInvite && <InviteDialog workspaceId={workspace.id} slug={slug} />}
        </div>

        {billing.plan === "free" && (
          <div className="flex items-center gap-3.5 rounded-xl border border-border-subtle bg-muted/60 px-3.5 py-3">
            <AvatarStack
              people={members.map((m) => ({ id: m.userId, name: m.fullName }))}
              max={4}
              openSeats={Math.max(0, 5 - billing.seatsUsed)}
            />
            <p className="flex-1 text-[13.5px]">
              <strong className="font-semibold">{billing.seatsUsed} of 5 seats used</strong> on the Free plan.
              {billing.seatsUsed >= 5 - invitations.length && invitations.length > 0
                ? " The pending invitation will take the last seat when it's accepted."
                : ""}
            </p>
            <Link href={`/w/${slug}/billing`} className="shrink-0 text-[13.5px] font-medium hover:underline">
              View plans
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[15px] font-semibold">Members</h2>
            <span className="font-mono text-xs text-muted-foreground">{members.length}</span>
          </div>
          <div className="rounded-xl border border-border-subtle">
            <div className="grid grid-cols-[minmax(0,1fr)_120px_44px] rounded-t-xl border-b border-border-subtle bg-muted/60 px-4 py-2.5 text-[12.5px] font-medium text-muted-foreground">
              <span>Name</span>
              <span>Role</span>
              <span />
            </div>
            {members.map((member) => (
              <MemberRow
                key={member.userId}
                member={member}
                workspaceId={workspace.id}
                slug={slug}
                viewerRole={workspace.role}
                viewerUserId={viewerUserId}
              />
            ))}
          </div>
        </div>

        {canInvite && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[15px] font-semibold">Pending invitations</h2>
              <span className="font-mono text-xs text-muted-foreground">{invitations.length}</span>
              <span className="ml-1.5 text-[13px] text-muted-foreground">Visible to owners and admins</span>
            </div>
            {invitations.length === 0 ? (
              <p className="text-[13.5px] text-muted-foreground">No pending invitations.</p>
            ) : (
              <div className="rounded-xl border border-dashed border-border-subtle bg-background">
                {invitations.map((invitation) => (
                  <InvitationRow key={invitation.id} invitation={invitation} slug={slug} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
