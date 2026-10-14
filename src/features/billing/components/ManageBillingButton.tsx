"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createPortalSession } from "../actions";

export function ManageBillingButton({ workspaceId }: { workspaceId: string }) {
  const [state, formAction, pending] = useActionState(createPortalSession, null);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      {state && !state.ok && <p role="alert">{state.error.message}</p>}
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Redirecting..." : "Manage billing"}
      </Button>
    </form>
  );
}
