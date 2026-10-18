"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/app/PasswordInput";
import { Field } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { signUp } from "../actions";
import { OAuthButtons } from "./OAuthButtons";
import type { ActionResult } from "@/lib/result";

// Owns its own title (not AuthCard's) because the post-submit "Check
// your inbox" swap (handoff/08-authentication.md F7) needs the title
// itself to change, which a Server Component page can't drive - see
// AuthCard.tsx's comment on its optional `title` prop.
export function SignUpForm({
  next,
  defaultEmail,
  authProviders,
}: {
  next?: string;
  defaultEmail?: string;
  authProviders?: string;
}) {
  const submittedEmailRef = useRef(defaultEmail ?? "");

  // Wraps signUp (not called separately) so the submitted email is
  // captured as part of the same dispatch useActionState tracks -
  // calling signUp directly from a plain form action here would bypass
  // the dispatcher and state would never update after submit.
  function signUpAndRememberEmail(prevState: ActionResult<void> | null, formData: FormData) {
    submittedEmailRef.current = formData.get("email")?.toString() ?? submittedEmailRef.current;
    return signUp(prevState, formData);
  }

  const [state, formAction] = useActionState(signUpAndRememberEmail, null);

  // Success swap (F7): title + description change, an inset box echoes
  // the submitted address back, and the footer links change from
  // "Already have an account?" to "Use a different email" / "Back to
  // log in" - handoff/01-product-behavior-spec.md's underlying
  // behavior (no redirect, no auto-login) is unchanged, this is just
  // the F7 content the old bare <p role="status"> was missing.
  if (state?.ok) {
    return (
      <>
        <div className="mb-6 flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold tracking-[-0.02em]">Check your inbox</h1>
          <p role="status" className="text-[14px] text-muted-foreground">
            Check your email to confirm your account.
          </p>
        </div>
        <div className="rounded-lg bg-muted px-3.5 py-3 text-[14px] text-foreground">
          We sent the link to <strong className="font-semibold">{submittedEmailRef.current}</strong>. Open it on this
          device to continue.
        </div>
        <p className="mt-5 flex items-center justify-between text-[13.5px]">
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
            className="text-brand-ink underline"
          >
            Use a different email
          </Link>
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="text-brand-ink underline">
            Back to log in
          </Link>
        </p>
      </>
    );
  }

  const fieldErrors = state && !state.ok ? state.error.fieldErrors : undefined;

  return (
    <>
      <div className="mb-6 flex flex-col gap-1.5">
        <h1 className="text-xl font-semibold tracking-[-0.02em]">Create your account</h1>
        <p className="text-[14px] text-muted-foreground">Free for workspaces of up to five people.</p>
      </div>
      <OAuthButtons next={next} authProviders={authProviders} />
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
      <p className="mt-5 text-center text-[13.5px] text-muted-foreground">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="text-brand-ink underline">
          Log in
        </Link>
      </p>
    </>
  );
}
