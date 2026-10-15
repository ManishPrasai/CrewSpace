"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestPasswordReset } from "../actions";

export function RequestPasswordResetForm() {
  const [state, formAction] = useActionState(requestPasswordReset, null);

  // Non-enumerating success, unchanged (handoff/01-product-behavior-spec.md).
  if (state?.ok) {
    return (
      <p role="status">
        If an account exists for that email, we&apos;ve sent a password reset link.
      </p>
    );
  }

  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Email" htmlFor="email" error={fieldErrors?.email?.[0]}>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <SubmitButton pendingLabel="Sending..." className="mt-1">
        Send reset link
      </SubmitButton>
    </form>
  );
}
