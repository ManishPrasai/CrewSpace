"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { changeMemberRole, leaveWorkspace, removeMember } from "../actions";
import type { Member } from "../queries";

export function MemberRow({
  member,
  workspaceId,
  slug,
  viewerRole,
  viewerUserId,
}: {
  member: Member;
  workspaceId: string;
  slug: string;
  viewerRole: "owner" | "admin" | "member";
  viewerUserId: string;
}) {
  const [roleState, roleAction, rolePending] = useActionState(changeMemberRole, null);
  const [removeState, removeAction, removePending] = useActionState(removeMember, null);
  const [leaveState, leaveAction, leavePending] = useActionState(leaveWorkspace, null);

  const isSelf = member.userId === viewerUserId;
  const canChangeRole = viewerRole === "owner" && member.role !== "owner" && !isSelf;
  const canRemove =
    !isSelf &&
    member.role !== "owner" &&
    (viewerRole === "owner" || (viewerRole === "admin" && member.role === "member"));
  const canLeave = isSelf && member.role !== "owner";

  return (
    <li className="flex flex-col gap-1 border-b py-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p>{member.fullName ?? "Unnamed"}</p>
          <p className="text-sm text-muted-foreground">{member.role}</p>
        </div>
        <div className="flex items-center gap-2">
          {canChangeRole && (
            <form action={roleAction} className="flex items-center gap-1">
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="userId" value={member.userId} />
              <select name="role" defaultValue={member.role} disabled={rolePending}>
                <option value="admin">admin</option>
                <option value="member">member</option>
              </select>
              <Button type="submit" size="sm" disabled={rolePending}>
                Update
              </Button>
            </form>
          )}
          {canRemove && (
            <form action={removeAction}>
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="userId" value={member.userId} />
              <Button type="submit" size="sm" variant="destructive" disabled={removePending}>
                Remove
              </Button>
            </form>
          )}
          {canLeave && (
            <form action={leaveAction}>
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <Button type="submit" size="sm" variant="destructive" disabled={leavePending}>
                Leave
              </Button>
            </form>
          )}
        </div>
      </div>
      {roleState && !roleState.ok && <p role="alert">{roleState.error.message}</p>}
      {removeState && !removeState.ok && <p role="alert">{removeState.error.message}</p>}
      {leaveState && !leaveState.ok && <p role="alert">{leaveState.error.message}</p>}
    </li>
  );
}
