// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const validEnv: Record<string, string> = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: "vapid-public",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
  STRIPE_PRICE_PRO_MONTHLY: "price_123",
  RESEND_API_KEY: "re_123",
  EMAIL_FROM: "Crewspace <noreply@example.com>",
  VAPID_PRIVATE_KEY: "vapid-private",
  VAPID_SUBJECT: "mailto:you@example.com",
};

function stubValidEnv() {
  for (const [key, value] of Object.entries(validEnv)) {
    vi.stubEnv(key, value);
  }
}

describe("env", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("parses valid client and server env vars", async () => {
    stubValidEnv();
    const { clientEnv, serverEnv } = await import("./env");
    expect(clientEnv.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(serverEnv.STRIPE_SECRET_KEY).toBe("sk_test_123");
  });

  it("throws when a required client env var is invalid", async () => {
    stubValidEnv();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    await expect(import("./env")).rejects.toThrow(/client environment variables/);
  });

  it("throws when a required server env var is missing", async () => {
    stubValidEnv();
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    await expect(import("./env")).rejects.toThrow(/server environment variables/);
  });
});
