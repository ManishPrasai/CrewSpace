"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clientEnv } from "@/lib/env";
import { getSafeRedirect } from "@/lib/auth/safe-redirect";
import { err, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import {
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from "./schemas";

export async function signUp(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  // Optional: e.g. /invite/[token] carries this through signup so a
  // brand-new user lands back where they started after confirming their
  // email. Untrusted (comes from a URL query param on the signup page),
  // so it goes through the same validation as the login redirect.
  const next = formData.get("next")?.toString();
  const callbackUrl = next
    ? `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(getSafeRedirect(next))}`
    : `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/callback`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: callbackUrl,
    },
  });

  // Never branch on error content here. With email + phone confirmation
  // both enabled (see supabase/config.toml), GoTrue already returns an
  // obfuscated success-shaped response for an existing confirmed email, so
  // any error reaching this point is a genuine failure (rate limit,
  // network, etc.), never a signal that the account already exists.
  if (error) {
    console.error("signUp failed", error);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }

  return ok();
}

export async function signIn(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  // Same generic error whether the email doesn't exist, the password is
  // wrong, or the account isn't confirmed yet - distinguishing any of
  // those would leak whether an account exists for that email.
  if (error) {
    return err("UNAUTHENTICATED", "Invalid email or password");
  }

  redirect(getSafeRedirect(formData.get("next")?.toString()));
}

export async function signOut(formData?: FormData): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Optional `next` (handoff/08-authentication.md's "wrong account"
  // flow: log out, land back on /login?next=/invite/[token]). Validated
  // the same way as every other redirect target; defaults to /login,
  // unchanged for every existing caller that doesn't pass one.
  const next = formData?.get("next")?.toString();
  redirect(next ? `/login?next=${encodeURIComponent(getSafeRedirect(next))}` : "/login");
}

export async function requestPasswordReset(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password/update`,
  });
  if (error) {
    console.error("requestPasswordReset failed", error);
  }

  // Always ok, win or lose - never reveal whether the email has an account.
  return ok();
}

export async function updatePassword(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  // Requires an active recovery session (established by /auth/callback).
  // No session, expired link, or reused link all land here.
  if (error) {
    return err("UNAUTHENTICATED", "Your reset link has expired. Please request a new one.");
  }

  // "/" is the public marketing page - same bug class as the login
  // redirect fixed earlier this session. A user who just set a password
  // is authenticated and belongs in the app, not back on the logged-out
  // landing page.
  redirect("/workspaces");
}

// Account -> Profile (handoff/05-dependencies.md D1): profiles' RLS
// already lets a user update their own full_name/avatar_url (Day 1),
// this is the first UI to use that grant.
export async function updateProfile(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return err("VALIDATION", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return err("UNAUTHENTICATED", "Please log in.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", user.id);
  if (error) {
    console.error("updateProfile failed", error);
    return err("INTERNAL", "Something went wrong. Please try again.");
  }

  const slug = formData.get("slug")?.toString();
  if (slug) {
    revalidatePath(`/w/${slug}/settings`);
  }
  return ok();
}
