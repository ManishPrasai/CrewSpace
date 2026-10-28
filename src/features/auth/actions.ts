"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clientEnv } from "@/lib/env";
import { getSafeRedirect } from "@/lib/auth/safe-redirect";
import { err, ok, type ActionResult } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import {
  oauthProviderSchema,
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  updateProfileSchema,
  type OAuthProvider,
} from "./schemas";

// GoTrue doesn't request an email claim by default for any OIDC
// provider - each one needs it listed explicitly or the token exchange
// fails with no email on the identity. Azure in particular silently
// omits it from the default `openid` scope (confirmed against a real
// authorize URL and Supabase's own Azure guide: "Supabase Auth requires
// that Azure provide an email address"). Per-provider, not shared,
// since Google's default scope set already includes email and
// widening it isn't needed or asked for.
const OAUTH_SCOPES: Record<OAuthProvider, string | undefined> = {
  google: undefined,
  azure: "email",
  apple: undefined,
};

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

// ADR-026: a plain <form action={signInWithProvider}> per provider
// button, same shape as signOut - there's no form state to render back
// (a successful call always redirects away to the provider's own
// consent screen before the button's own page re-renders), so this
// isn't wired through useActionState like the email/password actions.
// Works without JS, per handoff/08-authentication.md's F0 note.
export async function signInWithProvider(formData: FormData): Promise<void> {
  const parsed = oauthProviderSchema.safeParse(formData.get("provider"));
  if (!parsed.success) {
    redirect("/login?error=callback_failed");
  }

  const next = formData.get("next")?.toString();
  const redirectTo = `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(getSafeRedirect(next))}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: parsed.data,
    options: { redirectTo, scopes: OAUTH_SCOPES[parsed.data] },
  });

  // Supabase/GoTrue itself being unreachable, or provider is still
  // enabled=false in supabase/config.toml (no real credentials yet,
  // ADR-026) - either way there's no consent-screen URL to send the
  // user to.
  if (error || !data.url) {
    console.error("signInWithProvider failed", error);
    redirect("/login?error=provider_unavailable");
  }

  redirect(data.url);
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

  // This form serves two entry points: the genuine forgot-password email
  // flow (no `next`, falls back to getSafeRedirect's default /workspaces
  // - a user who just set a password belongs in the app, not the
  // logged-out landing page) and a link from Account Settings (`next`
  // set to the settings page, so the user lands back where they started
  // instead of being disoriented by a jump to the workspace picker).
  redirect(`${getSafeRedirect(formData.get("next")?.toString())}?notice=saved`);
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
