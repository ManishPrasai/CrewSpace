"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/app/PasswordInput";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { signUp } from "../actions";

export function SignUpForm({ next, defaultEmail }: { next?: string; defaultEmail?: string }) {
  const [state, formAction] = useActionState(signUp, null);

  // Success swap, unchanged behavior (handoff/01-product-behavior-spec.md).
  if (state?.ok) {
    return <p role="status">Check your email to confirm your account.</p>;
  }

  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Full name" htmlFor="fullName" error={fieldErrors?.fullName?.[0]}>
        <Input name="fullName" autoComplete="name" required />
      </Field>
      <Field label="Email" htmlFor="email" error={fieldErrors?.email?.[0]}>
        <Input name="email" type="email" autoComplete="email" defaultValue={defaultEmail} required />
      </Field>
      <Field label="Password" htmlFor="password" error={fieldErrors?.password?.[0]}>
        <PasswordInput name="password" autoComplete="new-password" required />
      </Field>
      {state && !state.ok && !fieldErrors && <FormAlert tone="error">{state.error.message}</FormAlert>}
      <SubmitButton pendingLabel="Creating account..." className="mt-1">
        Create account
      </SubmitButton>
    </form>
  );
}
