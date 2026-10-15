"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { leaveWorkspace } from "../actions";

export function LeaveWorkspaceForm({ workspaceId }: { workspaceId: string }) {
  const [state, formAction] = useActionState(leaveWorkspace, null);

  return (
    <form
      action={formAction}
      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4"
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[14.5px] font-semibold">Leave workspace</h2>
        <p className="text-[13px] text-muted-foreground">
          You&rsquo;ll lose access immediately. Someone will need to invite you again to rejoin.
        </p>
        {state && !state.ok && <FormAlert tone="error">{state.error.message}</FormAlert>}
      </div>
      <SubmitButton variant="destructive" pendingLabel="Leaving...">
        Leave…
      </SubmitButton>
    </form>
  );
}
