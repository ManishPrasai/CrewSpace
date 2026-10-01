const DEFAULT_REDIRECT = "/";

// Only ever allow redirecting to a relative path on this app. Rejects
// protocol-relative ("//evil.com"), backslash-variant ("/\evil.com" -
// browsers treat \ as / for special schemes, same open-redirect vector),
// and absolute URLs (any scheme/host), falling back otherwise.
export function getSafeRedirect(
  next: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT,
): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }

  try {
    const url = new URL(next, "http://localhost");
    if (url.origin !== "http://localhost" || !url.pathname.startsWith("/")) {
      return fallback;
    }
  } catch {
    return fallback;
  }

  return next;
}
