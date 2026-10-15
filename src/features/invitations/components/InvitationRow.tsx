"use client";

import { useActionState, useEffect, useState } from "react";
import { MailIcon } from "lucide-react";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { RoleBadge } from "@/components/app/RoleBadge";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { toast } from "@/components/ui/toast";
import { resendInvitation, revokeInvitation } from "../actions";
import type { Invitation } from "../queries";

// handoff/02-visual-design-spec.md: a dashed avatar placeholder (the
// "not yet a member" motif, R11) instead of a real one, "Invitation
// sent" subtext, Resend + a bare destructive-text Revoke. 04-routes.md:
// "Revoke... -> confirm -> existing action", so it opens a ConfirmDialog
// rather than submitting directly like Resend does.
export function InvitationRow({ invitation, slug }: { invitation: Invitation; slug: string }) {
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [resendState, resendAction] = useActionState(resendInvitation, null);

  useEffect(() => {
    if (resendState?.ok) {
      toast.add({ title: `Invitation resent to ${invitation.email}`, type: "success" });
    }
    // invitation.email is stable for this row's lifetime, safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resendState]);

  return (
    <div className="flex flex-col gap-1 border-b border-border-subtle px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-input-hover text-muted-foreground">
          <MailIcon className="size-3.5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[14px] font-medium">{invitation.email}</span>
          <span className="text-[12.5px] text-muted-foreground">Invitation sent</span>
        </div>
        <RoleBadge role={invitation.role} />
        <form action={resendAction}>
          <input type="hidden" name="invitationId" value={invitation.id} />
          <input type="hidden" name="slug" value={slug} />
          <SubmitButton variant="outline" size="sm" pendingLabel="Resending...">
            Resend
          </SubmitButton>
        </form>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => setRevokeOpen(true)}
        >
          Revoke
        </Button>
      </div>
      {resendState && !resendState.ok && <FormAlert tone="error">{resendState.error.message}</FormAlert>}
      <ConfirmDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title="Revoke this invitation?"
        body={`${invitation.email} won't be able to use this invite link anymore.`}
        confirmLabel="Revoke"
        pendingLabel="Revoking..."
        action={revokeInvitation}
        hiddenFields={{ invitationId: invitation.id, slug }}
        onConfirmed={() => toast.add({ title: "Invitation revoked", type: "success" })}
      />
    </div>
  );
}
