import { defineConfig } from "@playwright/test";

// The webServer's `npm run dev` auto-loads .env.local via Next.js, but
// this config/test-runner process doesn't - needed for
// tests/e2e/helpers/db.ts's service-role client.
process.loadEnvFile(".env.local");

export default defineConfig({
  testDir: "./tests/e2e",
  // Every spec hits the same shared local Supabase + Mailpit instance and
  // the same dev server - running specs in parallel caused real
  // cross-test interference (confirmed: one spec's signup/confirm
  // round-trip timed out while another ran concurrently against the same
  // infra). Not a flake to retry around - force sequential execution.
  workers: 1,
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
