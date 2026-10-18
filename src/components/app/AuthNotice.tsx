import { FormAlert } from "@/components/ui/form-alert"

// handoff/08-authentication.md's allow-list, now exercised by
// src/app/auth/callback/route.ts's OAuth error mapping (ADR-026) as
// well as the original email-link case ("auth"). Tone matches the
// design frame F6: cancelled/link_required are neutral/info (the user
// backing out of a provider's consent screen isn't an error), the rest
// are genuine failures.
const ERROR_COPY: Record<string, { message: string; tone: "error" | "info" }> = {
  auth: { message: "That link has expired or already been used. Please try again.", tone: "error" },
  cancelled: { message: "Sign-in was cancelled. Choose a method to continue.", tone: "info" },
  provider_unavailable: {
    message: "That provider isn't responding right now. Try again in a minute, or use email.",
    tone: "error",
  },
  callback_failed: { message: "We couldn't finish signing you in. Please start again.", tone: "error" },
  session_failed: {
    message: "Your sign-in worked, but we couldn't start your session. Please try again.",
    tone: "error",
  },
  email_unverified: {
    message: "That provider didn't share a verified email address. Verify it with the provider, or sign up with email.",
    tone: "error",
  },
  link_required: {
    message: "This email already has a Crewspace account. Log in with your password to continue.",
    tone: "info",
  },
};

export function AuthNotice({ code }: { code?: string }) {
  if (!code || !(code in ERROR_COPY)) {
    return null;
  }

  const { message, tone } = ERROR_COPY[code];
  return <FormAlert tone={tone}>{message}</FormAlert>;
}
