"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { resendInvitation, revokeInvitation } from "../actions";
import type { Invitation } from "../queries";

export function InvitationRow({ invitation, slug }: { invitation: Invitation; slug: string }) {
  const [revokeState, revokeAction, revokePending] = useActionState(revokeInvitation, null);
  const [resendState, resendAction, resendPending] = useActionState(resendInvitation, null);

  return (
    <li className="flex flex-col gap-1 border-b py-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p>{invitation.email}</p>
          <p className="text-sm text-muted-foreground">{invitation.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <form action={resendAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="slug" value={slug} />
            <Button type="submit" size="sm" variant="outline" disabled={resendPending}>
              Resend
            </Button>
          </form>
          <form action={revokeAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="slug" value={slug} />
            <Button type="submit" size="sm" variant="destructive" disabled={revokePending}>
              Revoke
            </Button>
          </form>
        </div>
      </div>
      {revokeState && !revokeState.ok && <p role="alert">{revokeState.error.message}</p>}
      {resendState && !resendState.ok && <p role="alert">{resendState.error.message}</p>}
    </li>
  );
}
