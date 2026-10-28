import { FormAlert } from "@/components/ui/form-alert"

// handoff/08-authentication.md's allow-list, now exercised by
// src/app/auth/callback/route.ts's OAuth error mapping (ADR-026) as
// well as the original email-link case ("auth"). Tone matches the
// design frame F6: cancelled is neutral/info (the user backing out of
// a provider's consent screen isn't an error), the rest are genuine
// failures. Only the codes classifyErrorCode() (route.ts) and the
// access_denied/no-code fallback can actually produce are listed here
// - link_required and session_failed were removed (account-linking
// audit, 2026-10-27): nothing in the codebase ever sets either code,
// both were dead since they were written.
const ERROR_COPY: Record<string, { message: string; tone: "error" | "info" }> = {
  auth: { message: "That link has expired or already been used. Please try again.", tone: "error" },
  cancelled: { message: "Sign-in was cancelled. Choose a method to continue.", tone: "info" },
  provider_unavailable: {
    message: "That provider isn't responding right now. Try again in a minute, or use email.",
    tone: "error",
  },
  callback_failed: { message: "We couldn't finish signing you in. Please start again.", tone: "error" },
  email_unverified: {
    message: "That provider didn't share a verified email address. Verify it with the provider, or sign up with email.",
    tone: "error",
  },
  // Distinct from provider_unavailable (ADR-026 follow-up): a real,
  // persistent misconfiguration on our side (bad provider setup, not
  // the provider being temporarily down) - "try again" would just fail
  // the same way every time, so this copy doesn't suggest retrying.
  provider_config_error: {
    message: "Sign-in with that provider isn't set up correctly right now. Please use email, or try again later.",
    tone: "error",
  },
};

export function AuthNotice({ code }: { code?: string }) {
  if (!code || !(code in ERROR_COPY)) {
    return null;
  }

  const { message, tone } = ERROR_COPY[code];
  return <FormAlert tone={tone}>{message}</FormAlert>;
}
