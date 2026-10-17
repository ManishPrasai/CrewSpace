import { defaultExclude, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // tests/e2e/ holds Playwright specs (test:e2e script), not Vitest
    // ones - without this, vitest's default *.spec.ts glob picks them up
    // too and fails on @playwright/test's incompatible `test()`.
    exclude: [...defaultExclude, "tests/e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
