import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirect } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

// ADR-026 follow-up: this route already handled email-confirmation and
// password-reset links before OAuth existed - exchangeCodeForSession
// is provider-agnostic, so OAuth's return leg reuses it unchanged.
//
// Maps GoTrue's documented error_code values
// (supabase.com/docs/guides/auth/debugging/error-codes) to one of our
// 4 user-facing buckets, instead of collapsing every non-cancellation
// failure into one generic "provider unavailable" message - a genuine
// permanent misconfiguration (wrong/disabled provider, broken OAuth
// state) looks identical to a real outage otherwise, and "try again in
// a minute" is actively misleading for the former.
function classifyErrorCode(errorCode: string | undefined): "email_unverified" | "provider_config_error" | "provider_unavailable" {
  switch (errorCode) {
    // Provider didn't give us a usable/verified email - distinct from
    // a missing scope (fixed at the source, see signInWithProvider's
    // per-provider `scopes`), this is GoTrue explicitly saying the
    // identity it got isn't good enough to sign in with.
    case "email_not_confirmed":
    case "provider_email_needs_verification":
    case "saml_assertion_no_email":
      return "email_unverified";
    // Real, persistent setup problems - retrying changes nothing.
    case "oauth_provider_not_supported":
    case "provider_disabled":
    case "bad_oauth_callback":
    case "bad_oauth_state":
    case "flow_state_expired":
    case "flow_state_not_found":
      return "provider_config_error";
    // unexpected_failure/request_timeout/conflict/hook_timeout/rate
    // limits, and anything undocumented - genuinely transient or
    // unknown, so "try again" is still the honest default.
    default:
      return "provider_unavailable";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const providerError = searchParams.get("error");
  const providerErrorCode = searchParams.get("error_code") ?? undefined;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(getSafeRedirect(next), request.url));
    }
    // Never log the code itself (a one-time-use authorization code,
    // sensitive) - only GoTrue's own error shape.
    console.error("exchangeCodeForSession failed", error.code, error.message);
    const bucket = classifyErrorCode(error.code);
    return NextResponse.redirect(new URL(`/login?error=${bucket}`, request.url));
  }

  // RFC 6749 6.1.1.4: a denied/cancelled authorization comes back as
  // ?error=access_denied, never a ?code - this is the one case that's
  // genuinely the user backing out, not a failure of any kind.
  if (providerError === "access_denied") {
    return NextResponse.redirect(new URL("/login?error=cancelled", request.url));
  }
  if (providerError) {
    console.error("OAuth provider returned an error", providerError, providerErrorCode, searchParams.get("error_description"));
    const bucket = classifyErrorCode(providerErrorCode);
    return NextResponse.redirect(new URL(`/login?error=${bucket}`, request.url));
  }

  return NextResponse.redirect(new URL("/login?error=auth", request.url));
}
