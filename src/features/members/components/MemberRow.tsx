"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { RoleBadge } from "@/components/app/RoleBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { leaveWorkspace, removeMember } from "../actions";
import type { Member } from "../queries";

// handoff/02-visual-design-spec.md + the AU2c audit correction: name +
// role badge + a ⋯ menu only - no email, no Joined column (R07/R08
// both default off, see docs/decisions.md). "View details" is a real
// link to the no-JS fallback page (05-dependencies R15), not a client
// dialog - there's little enough member data (no email, no joined date)
// that a separate dialog implementation would just duplicate that
// page's content, so the page is the only implementation, used by both
// the JS and no-JS paths.
//
// Remove/Leave render as a ConfirmDialog *outside* the dropdown, driven
// by local open state rather than a nested DialogTrigger - a dialog
// trigger nested inside a menu item never opens, because the menu
// closes (and can unmount the item) on the same click before the
// dialog gets a chance to.
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
  const [removeOpen, setRemoveOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const isSelf = member.userId === viewerUserId;
  const canChangeRole = viewerRole === "owner" && member.role !== "owner" && !isSelf;
  const canRemove =
    !isSelf &&
    member.role !== "owner" &&
    (viewerRole === "owner" || (viewerRole === "admin" && member.role === "member"));
  const canLeave = isSelf && member.role !== "owner";
  const hasMenu = canChangeRole || canRemove || canLeave;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_120px_44px] items-center gap-2 border-b border-border-subtle px-4 py-3 last:border-b-0">
      <Link href={`/w/${slug}/members/${member.userId}`} className="flex min-w-0 items-center gap-3">
        <Avatar id={member.userId} name={member.fullName} size={32} />
        <span className="truncate text-[14px] font-medium">
          {member.fullName ?? "Unnamed"}
          {isSelf && <span className="font-normal text-muted-foreground"> · You</span>}
        </span>
      </Link>
      <RoleBadge role={member.role} />
      {hasMenu ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Member actions" />}
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`/w/${slug}/members/${member.userId}`} />}>
                View details
              </DropdownMenuItem>
              {canChangeRole && (
                <DropdownMenuItem render={<Link href={`/w/${slug}/members/${member.userId}`} />}>
                  Change role
                </DropdownMenuItem>
              )}
              {(canRemove || canLeave) && <DropdownMenuSeparator />}
              {canRemove && (
                <DropdownMenuItem variant="destructive" onClick={() => setRemoveOpen(true)}>
                  Remove from workspace…
                </DropdownMenuItem>
              )}
              {canLeave && (
                <DropdownMenuItem variant="destructive" onClick={() => setLeaveOpen(true)}>
                  Leave workspace…
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {canRemove && (
            <ConfirmDialog
              open={removeOpen}
              onOpenChange={setRemoveOpen}
              title={`Remove ${member.fullName ?? "this member"}?`}
              body="They lose access immediately. You can invite them again later."
              confirmLabel="Remove"
              pendingLabel="Removing..."
              action={removeMember}
              hiddenFields={{ workspaceId, userId: member.userId, slug }}
            />
          )}
          {canLeave && (
            <ConfirmDialog
              open={leaveOpen}
              onOpenChange={setLeaveOpen}
              title="Leave this workspace?"
              body="You'll lose access immediately. Someone will need to invite you again to rejoin."
              confirmLabel="Leave"
              pendingLabel="Leaving..."
              action={leaveWorkspace}
              hiddenFields={{ workspaceId }}
            />
          )}
        </>
      ) : (
        <span />
      )}
    </div>
  );
}
