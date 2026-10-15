"use client";

import { useActionState } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { createPortalSession } from "../actions";

// handoff/04-routes.md: "Update payment = ManageBillingButton relabelled
// when status is past_due" - same action, different label/urgency, not
// a second component.
export function ManageBillingButton({
  workspaceId,
  urgent = false,
}: {
  workspaceId: string;
  urgent?: boolean;
}) {
  const [state, formAction] = useActionState(createPortalSession, null);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      {state && !state.ok && <FormAlert tone="error">{state.error.message}</FormAlert>}
      <SubmitButton variant={urgent ? "default" : "outline"} pendingLabel="Redirecting...">
        {urgent ? "Update payment" : "Manage billing"}
        <ArrowUpRightIcon />
      </SubmitButton>
    </form>
  );
}
