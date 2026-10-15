"use client";

import { useActionState } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { createCheckoutSession } from "../actions";

export function UpgradeButton({ workspaceId }: { workspaceId: string }) {
  const [state, formAction] = useActionState(createCheckoutSession, null);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      {state && !state.ok && <FormAlert tone="error">{state.error.message}</FormAlert>}
      <SubmitButton pendingLabel="Redirecting...">
        Upgrade to Pro
        <ArrowUpRightIcon />
      </SubmitButton>
    </form>
  );
}
