export const THEME_COOKIE = "theme";
export type Theme = "system" | "light" | "dark";

export function isTheme(value: string | undefined): value is Theme {
  return value === "system" || value === "light" || value === "dark";
}

// Runs synchronously in <head>, before paint, so there's no flash of
// the wrong theme even though the server always renders without the
// `dark` class (handoff/05-dependencies.md: "Appearance... frontend-
// only, localStorage + cookie"). Reads the cookie `applyTheme` writes
// below, not localStorage - one source of truth for every client read.
export const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

// Client-only (document/window) - call from "use client" components.
export function getStoredTheme(): Theme {
  if (typeof document === "undefined") return "system";
  const match = document.cookie.match(/(?:^|; )theme=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return isTheme(value) ? value : "system";
}

export function applyTheme(theme: Theme): void {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}
