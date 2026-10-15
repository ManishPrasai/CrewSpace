"use client";

import Link from "next/link";
import { useActionState } from "react";
import { PasswordInput } from "@/components/app/PasswordInput";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { signIn } from "../actions";

export function LoginForm({ next, defaultEmail }: { next?: string; defaultEmail?: string }) {
  const [state, formAction] = useActionState(signIn, null);
  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" htmlFor="email" error={fieldErrors?.email?.[0]}>
        <Input name="email" type="email" autoComplete="email" defaultValue={defaultEmail} required />
      </Field>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-[13px] font-medium text-foreground">
            Password
          </label>
          {/* Link only (handoff/04-routes.md: new on /login) - /reset-password already exists. */}
          <Link href="/reset-password" className="text-[13px] text-brand-ink hover:underline">
            Forgot password?
          </Link>
        </div>
        <PasswordInput name="password" autoComplete="current-password" required />
      </div>
      {state && !state.ok && !fieldErrors && <FormAlert tone="error">{state.error.message}</FormAlert>}
      <SubmitButton pendingLabel="Logging in..." className="mt-1">
        Log in
      </SubmitButton>
    </form>
  );
}
