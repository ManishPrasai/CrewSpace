import { test, expect } from "@playwright/test";

// docs/tasks.md Day 9: "Lighthouse check: PWA installable, accessibility".
// Accessibility is covered by scripts/lighthouse.mjs (npm run
// test:lighthouse) and the axe-core checks in onboarding.spec.ts.
//
// PWA installability can't go through Lighthouse anymore: Lighthouse
// 13.x removed the scored "pwa" category and every individual PWA audit
// it used to run (confirmed by grepping node_modules/lighthouse/core/
// config/default-config.js - only performance/accessibility/
// best-practices/seo/agentic-browsing remain). Chrome's own
// installability engine is still reachable directly over CDP
// (Page.getInstallabilityErrors) - the same check Chrome itself uses to
// decide whether to show an install prompt, and more authoritative than
// Lighthouse's old heuristic audits ever were. No new dependency needed:
// Playwright already exposes CDP sessions.
test("home page is a real installable PWA per Chrome's own installability check", async ({ page }) => {
  const client = await page.context().newCDPSession(page);
  await page.goto("/");

  const { installabilityErrors } = await client.send("Page.getInstallabilityErrors");

  expect(
    installabilityErrors,
    installabilityErrors.map((e) => `${e.errorId}: ${e.errorArguments.map((a) => `${a.name}=${a.value}`).join(", ")}`).join("\n"),
  ).toEqual([]);
});
