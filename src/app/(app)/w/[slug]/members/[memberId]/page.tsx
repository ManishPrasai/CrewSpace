import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import { PanelHeader } from "@/components/app/PanelHeader";
import { RoleBadge } from "@/components/app/RoleBadge";
import { LeaveWorkspaceForm } from "@/features/members/components/LeaveWorkspaceForm";
import { RemoveMemberForm } from "@/features/members/components/RemoveMemberForm";
import { RoleEditor } from "@/features/members/components/RoleEditor";
import { getMembers } from "@/features/members/queries";
import { getWorkspaceBySlug } from "@/features/workspaces/queries";
import { createClient } from "@/lib/supabase/server";

// handoff/05-dependencies.md R15: this page IS the no-JS fallback for
// "view details / change role / remove" - there's no separate client
// MemberDetailsDialog duplicating it (see MemberRow.tsx's comment).
// Remove/Leave here are plain forms, not a further confirm step: the
// dialog's own confirm step only exists as a JS nicety on the table
// view (ConfirmDialog); navigating to this dedicated page and reading
// the labelled destructive section already serves as the confirmation
// when JS is off.
export default async function MemberDetailsPage({
  params,
}: {
  params: Promise<{ slug: string; memberId: string }>;
}) {
  const { slug, memberId } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    notFound();
  }

  const members = await getMembers(workspace.id);
  const member = members.find((m) => m.userId === memberId);
  if (!member) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewerUserId = user?.id ?? "";
  const isSelf = member.userId === viewerUserId;

  const canChangeRole = workspace.role === "owner" && member.role !== "owner" && !isSelf;
  const canRemove =
    !isSelf &&
    member.role !== "owner" &&
    (workspace.role === "owner" || (workspace.role === "admin" && member.role === "member"));
  const canLeave = isSelf && member.role !== "owner";

  return (
    <div className="flex flex-col">
      <PanelHeader
        breadcrumb={
          <>
            <Link href={`/w/${slug}/members`} className="hover:text-foreground">
              {workspace.name} <span className="px-1.5 text-border-subtle">/</span> Members
            </Link>
            <span className="px-1.5 text-border-subtle">/</span>
            <span className="font-medium text-foreground">{member.fullName ?? "Unnamed"}</span>
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-5 pt-7 pb-10 sm:px-8">
        <Link
          href={`/w/${slug}/members`}
          className="flex items-center gap-1.5 text-[13.5px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to members
        </Link>

        <div className="flex min-w-0 items-center gap-3.5">
          <Avatar id={member.userId} name={member.fullName} size={48} />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-[17px] font-semibold tracking-[-0.015em]">{member.fullName ?? "Unnamed"}</span>
            <RoleBadge role={member.role} />
          </div>
        </div>

        {canChangeRole && (
          <RoleEditor
            workspaceId={workspace.id}
            userId={member.userId}
            slug={slug}
            memberName={member.fullName ?? "This member"}
            currentRole={member.role === "owner" ? "admin" : member.role}
          />
        )}

        {canRemove && (
          <RemoveMemberForm
            workspaceId={workspace.id}
            userId={member.userId}
            slug={slug}
            memberName={member.fullName ?? "This member"}
          />
        )}

        {canLeave && <LeaveWorkspaceForm workspaceId={workspace.id} />}
      </div>
    </div>
  );
}
