import { FormAlert } from "@/components/ui/form-alert"

// handoff/08-authentication.md lists a larger allow-list for future
// OAuth codes (cancelled, provider_unavailable, ...) - only "auth" is
// ever actually generated today (src/app/auth/callback/route.ts), so
// that's the only one mapped. No placeholders for codes nothing sends.
const ERROR_COPY: Record<string, string> = {
  auth: "That link has expired or already been used. Please try again.",
};

export function AuthNotice({ code }: { code?: string }) {
  if (!code || !(code in ERROR_COPY)) {
    return null;
  }

  return <FormAlert tone="error">{ERROR_COPY[code]}</FormAlert>;
}
