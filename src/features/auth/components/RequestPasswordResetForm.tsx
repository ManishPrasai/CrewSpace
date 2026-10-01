"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "../actions";

export function RequestPasswordResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, null);

  if (state?.ok) {
    return (
      <p role="status">
        If an account exists for that email, we&apos;ve sent a password reset link.
      </p>
    );
  }

  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {fieldErrors?.email && <p role="alert">{fieldErrors.email[0]}</p>}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
