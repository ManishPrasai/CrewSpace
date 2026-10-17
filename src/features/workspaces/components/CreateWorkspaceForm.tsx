"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { createWorkspace } from "../actions";

// handoff: W1 (has existing workspaces) lays the fields out side by side
// with helper text + an inline button on the same row; W2 (genuinely
// empty, inside the centered first-workspace hero) stacks everything
// full-width instead. Same fields/action either way.
export function CreateWorkspaceForm({ stacked = false }: { stacked?: boolean }) {
  const [state, formAction] = useActionState(createWorkspace, null);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className={stacked ? "flex flex-col gap-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
        <Field label="Name" htmlFor="name" error={fieldErrors?.name?.[0]}>
          <Input name="name" autoComplete="off" required />
        </Field>
        <Field label="URL" htmlFor="slug" error={fieldErrors?.slug?.[0]}>
          <Input name="slug" autoComplete="off" placeholder="bhadrapur-fc" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
        </Field>
      </div>
      {state && !state.ok && !fieldErrors && <FormAlert tone="error">{state.error.message}</FormAlert>}
      {stacked ? (
        <SubmitButton pendingLabel="Creating...">Create workspace</SubmitButton>
      ) : (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-muted-foreground">You&rsquo;ll be the owner. You can rename it later; the URL stays.</p>
          <SubmitButton pendingLabel="Creating..." className="w-full shrink-0 sm:w-auto">
            Create workspace
          </SubmitButton>
        </div>
      )}
    </form>
  );
}
