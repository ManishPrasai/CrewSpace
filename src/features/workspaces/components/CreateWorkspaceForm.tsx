"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWorkspace } from "../actions";

export function CreateWorkspaceForm() {
  const [state, formAction, pending] = useActionState(createWorkspace, null);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="name">Workspace name</label>
        <Input id="name" name="name" autoComplete="off" required />
        {fieldErrors?.name && <p role="alert">{fieldErrors.name[0]}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="slug">URL</label>
        <Input
          id="slug"
          name="slug"
          autoComplete="off"
          placeholder="bhadrapur-fc"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          required
        />
        {fieldErrors?.slug && <p role="alert">{fieldErrors.slug[0]}</p>}
      </div>
      {state && !state.ok && !fieldErrors && <p role="alert">{state.error.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create workspace"}
      </Button>
    </form>
  );
}
