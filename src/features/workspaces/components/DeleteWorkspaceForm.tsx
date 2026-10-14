"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteWorkspace } from "../actions";

export function DeleteWorkspaceForm({
  workspaceId,
  slug,
  canDelete,
}: {
  workspaceId: string;
  slug: string;
  canDelete: boolean;
}) {
  const [state, formAction, pending] = useActionState(deleteWorkspace, null);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  if (!canDelete) {
    return <p>Cancel the Pro subscription on the billing page before deleting this workspace.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <label htmlFor="slugConfirmation">
        Type <strong>{slug}</strong> to confirm deletion
      </label>
      <Input id="slugConfirmation" name="slugConfirmation" autoComplete="off" required />
      {fieldErrors?.slugConfirmation && <p role="alert">{fieldErrors.slugConfirmation[0]}</p>}
      {state && !state.ok && !fieldErrors && <p role="alert">{state.error.message}</p>}
      <Button type="submit" variant="destructive" disabled={pending}>
        {pending ? "Deleting..." : "Delete workspace"}
      </Button>
    </form>
  );
}
