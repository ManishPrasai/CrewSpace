import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Real paths behind the (app) route group, per docs/architecture.md.
// Route groups are stripped from the URL, so this has to match on the
// actual paths rather than "(app)" itself. /invite/[token] is a sibling
// of (app), not inside it, and has its own login-or-signup redirect
// logic (Day 4) - deliberately not covered here.
const PROTECTED_PATH_PREFIXES = ["/workspaces", "/w"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search,
    );

    const redirectResponse = NextResponse.redirect(loginUrl);
    // Carry over any cookie mutations updateSession made (e.g. clearing
    // a stale/expired session cookie) instead of silently dropping them.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
