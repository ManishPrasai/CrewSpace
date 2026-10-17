"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { createWorkspace } from "../actions";

export function CreateWorkspaceForm() {
  const [state, formAction] = useActionState(createWorkspace, null);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field label="Workspace name" htmlFor="name" error={fieldErrors?.name?.[0]}>
        <Input name="name" autoComplete="off" required />
      </Field>
      <Field label="URL" htmlFor="slug" hint="Lowercase letters, numbers and hyphens." error={fieldErrors?.slug?.[0]}>
        <Input name="slug" autoComplete="off" placeholder="bhadrapur-fc" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
      </Field>
      {state && !state.ok && !fieldErrors && <FormAlert tone="error">{state.error.message}</FormAlert>}
      <SubmitButton pendingLabel="Creating...">Create workspace</SubmitButton>
    </form>
  );
}
