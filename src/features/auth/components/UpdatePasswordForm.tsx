"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/app/PasswordInput";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { updatePassword } from "../actions";

export function UpdatePasswordForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(updatePassword, null);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="New password" htmlFor="password" error={fieldErrors?.password?.[0]}>
        <PasswordInput name="password" autoComplete="new-password" required />
      </Field>
      {state && !state.ok && !fieldErrors && <FormAlert tone="error">{state.error.message}</FormAlert>}
      <SubmitButton pendingLabel="Updating..." className="mt-1">
        Update password
      </SubmitButton>
    </form>
  );
}
