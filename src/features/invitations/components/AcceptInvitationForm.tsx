"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "../actions";

export function AcceptInvitationForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInvitation, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      {state && !state.ok && <p role="alert">{state.error.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Joining..." : "Accept invitation"}
      </Button>
    </form>
  );
}
