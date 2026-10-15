"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { removeMember } from "../actions";

// Plain form, no confirm step - this is the no-JS fallback page itself
// (handoff/05-dependencies.md R15), so the dedicated page already serves
// as the confirmation; the table view's ConfirmDialog is the JS nicety.
export function RemoveMemberForm({
  workspaceId,
  userId,
  slug,
  memberName,
}: {
  workspaceId: string;
  userId: string;
  slug: string;
  memberName: string;
}) {
  const [state, formAction] = useActionState(removeMember, null);

  return (
    <form
      action={formAction}
      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4"
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="slug" value={slug} />
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[14.5px] font-semibold">Remove from workspace</h2>
        <p className="text-[13px] text-muted-foreground">
          {memberName} loses access immediately. You can invite them again later.
        </p>
        {state && !state.ok && <FormAlert tone="error">{state.error.message}</FormAlert>}
      </div>
      <SubmitButton variant="destructive" pendingLabel="Removing...">
        Remove…
      </SubmitButton>
    </form>
  );
}
