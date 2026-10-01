"use server";

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

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/callback`,
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

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
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

  redirect("/");
}
