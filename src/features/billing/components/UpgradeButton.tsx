"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "../actions";

export function UpgradeButton({ workspaceId }: { workspaceId: string }) {
  const [state, formAction, pending] = useActionState(createCheckoutSession, null);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      {state && !state.ok && <p role="alert">{state.error.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Redirecting..." : "Upgrade to Pro"}
      </Button>
    </form>
  );
}
