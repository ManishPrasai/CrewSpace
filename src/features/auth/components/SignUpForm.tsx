"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "../actions";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, null);

  if (state?.ok) {
    return (
      <p role="status">
        Check your email to confirm your account.
      </p>
    );
  }

  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="fullName">Full name</label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
        {fieldErrors?.fullName && <p role="alert">{fieldErrors.fullName[0]}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {fieldErrors?.email && <p role="alert">{fieldErrors.email[0]}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password">Password</label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        {fieldErrors?.password && <p role="alert">{fieldErrors.password[0]}</p>}
      </div>
      {state && !state.ok && !fieldErrors && <p role="alert">{state.error.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Signing up..." : "Sign up"}
      </Button>
    </form>
  );
}
