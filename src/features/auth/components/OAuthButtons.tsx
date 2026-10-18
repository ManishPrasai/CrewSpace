"use client";

import { useState } from "react";
import { signInWithProvider } from "../actions";

// Official unmodified brand marks per each provider's own guidelines,
// 18px, never redrawn/simplified (handoff/08-authentication.md F0).
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.5C29.4 34.9 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C40.9 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.468 2.19-1.23 2.97-.78.82-2.07 1.44-3.12 1.36-.12-1.08.42-2.22 1.17-3 .81-.84 2.19-1.47 3.18-1.33zM20.52 17.04c-.51 1.17-.75 1.69-1.4 2.72-.9 1.44-2.19 3.24-3.78 3.26-1.41.02-1.77-.9-3.69-.9-1.92 0-2.32.88-3.72.92-1.59.05-2.81-1.55-3.72-2.98-2.52-4.01-2.78-8.71-1.23-11.21.98-1.59 2.59-2.51 4.11-2.51 1.5 0 2.46.92 3.7.92 1.21 0 1.97-.92 3.7-.92 1.36 0 2.81.74 3.8 2.03-3.35 1.84-2.8 6.35.03 7.57z" />
    </svg>
  );
}

const PROVIDERS = {
  google: { label: "Google", Icon: GoogleIcon },
  azure: { label: "Microsoft", Icon: MicrosoftIcon },
  apple: { label: "Apple", Icon: AppleIcon },
} as const;

type Provider = keyof typeof PROVIDERS;
const PROVIDER_ORDER: Provider[] = ["google", "azure", "apple"];

function enabledProviders(raw: string | undefined): Provider[] {
  if (!raw) return [];
  const requested = new Set(raw.split(",").map((p) => p.trim().toLowerCase()));
  return PROVIDER_ORDER.filter((p) => requested.has(p));
}

// handoff/08-authentication.md F0/F5: clicking a provider shows
// "Connecting to {Provider}..." on that button and disables the other
// two until the page navigates away. Each provider is its own
// <form action={signInWithProvider}> (works without JS as a plain
// POST either way) - useFormStatus only reports a single form's own
// pending state, not its siblings', so the shared pendingProvider
// state here (a client-only enhancement, not required for the form to
// function) is what actually coordinates "disable the other two".
function ProviderButton({
  provider,
  next,
  pendingProvider,
  onSubmitStart,
}: {
  provider: Provider;
  next?: string;
  pendingProvider: Provider | null;
  onSubmitStart: (provider: Provider) => void;
}) {
  const { label, Icon } = PROVIDERS[provider];
  const isThisPending = pendingProvider === provider;
  const disabled = pendingProvider !== null && !isThisPending;

  return (
    <form action={signInWithProvider} onSubmit={() => onSubmitStart(provider)}>
      <input type="hidden" name="provider" value={provider} />
      {next && <input type="hidden" name="next" value={next} />}
      <button
        type="submit"
        aria-busy={isThisPending}
        disabled={disabled}
        className="grid h-11 w-full grid-cols-[18px_1fr_18px] items-center gap-2 rounded-[10px] border border-[#8E8C86] bg-background px-3.5 text-[14.5px] font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <Icon />
        <span className="text-center">{isThisPending ? `Connecting to ${label}…` : `Continue with ${label}`}</span>
        <span aria-hidden="true" />
      </button>
    </form>
  );
}

// `authProviders` is the raw NEXT_PUBLIC_AUTH_PROVIDERS value, read
// server-side by the page and passed down as a plain prop - not read
// here via clientEnv directly, which would pull src/lib/env.ts's zod
// import (and its serverSchema definitions) into this client bundle
// for one string. Confirmed via a real build: that import alone added
// ~100kB to /login and /signup's First Load JS.
export function OAuthButtons({ next, authProviders }: { next?: string; authProviders?: string }) {
  const providers = enabledProviders(authProviders);
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  if (providers.length === 0) return null;

  return (
    <div className="mb-5 flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        {providers.map((provider) => (
          <ProviderButton
            key={provider}
            provider={provider}
            next={next}
            pendingProvider={pendingProvider}
            onSubmitStart={setPendingProvider}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
        <div className="h-px flex-1 bg-border-subtle" />
        or continue with email
        <div className="h-px flex-1 bg-border-subtle" />
      </div>
    </div>
  );
}
