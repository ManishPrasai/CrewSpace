import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirect } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

// ADR-026: this route already handled email-confirmation and
// password-reset links before OAuth existed - exchangeCodeForSession
// is provider-agnostic, so OAuth's return leg reuses it unchanged,
// just with richer error-code mapping than the single "auth" code
// this previously always sent on any failure.
//
// Precise mapping of every GoTrue/provider error shape to
// cancelled/provider_unavailable/email_unverified/link_required isn't
// verifiable without a real provider configured (none are yet - see
// ADR-026) - ships the two cases confirmable from the OAuth2 spec
// itself (RFC 6749 6.1.1.4: a denied/cancelled authorization comes
// back as ?error=access_denied, not a ?code) and a safe default for
// everything else. Revisit once a real provider exists to test against.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const providerError = searchParams.get("error");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(getSafeRedirect(next), request.url));
    }
    console.error("exchangeCodeForSession failed", error);
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url));
  }

  if (providerError === "access_denied") {
    return NextResponse.redirect(new URL("/login?error=cancelled", request.url));
  }
  if (providerError) {
    console.error("OAuth provider returned an error", providerError, searchParams.get("error_description"));
    return NextResponse.redirect(new URL("/login?error=provider_unavailable", request.url));
  }

  return NextResponse.redirect(new URL("/login?error=auth", request.url));
}
