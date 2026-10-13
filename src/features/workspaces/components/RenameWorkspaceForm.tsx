"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renameWorkspace } from "../actions";

export function RenameWorkspaceForm({
  workspaceId,
  name,
}: {
  workspaceId: string;
  name: string;
}) {
  const [state, formAction, pending] = useActionState(renameWorkspace, null);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="flex flex-col gap-1">
        <label htmlFor="name">Workspace name</label>
        <Input id="name" name="name" defaultValue={name} required />
        {fieldErrors?.name && <p role="alert">{fieldErrors.name[0]}</p>}
      </div>
      {state && !state.ok && !fieldErrors && <p role="alert">{state.error.message}</p>}
      {state?.ok && <p role="status">Saved.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
