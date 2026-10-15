"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { acceptInvitation } from "../actions";

export function AcceptInvitationForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(acceptInvitation, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      {state && !state.ok && <FormAlert tone="error">{state.error.message}</FormAlert>}
      <SubmitButton pendingLabel="Joining...">Accept invitation</SubmitButton>
    </form>
  );
}
