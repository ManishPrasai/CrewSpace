// docs/tasks.md Day 9: "Lighthouse check: PWA installable, accessibility".
//
// Lighthouse 13.x removed the scored "pwa" category and every individual
// PWA audit it used to run (installable-manifest, service-worker, etc. -
// confirmed by grepping node_modules/lighthouse/core/config/
// default-config.js: only performance/accessibility/best-practices/seo/
// agentic-browsing remain). PWA installability is checked separately in
// tests/e2e/pwa.spec.ts via Chrome's own real installability engine
// (CDP's Page.getInstallabilityErrors) - a more authoritative source
// than Lighthouse's old heuristic audits ever were, and needs no new
// dependency since Playwright already exposes CDP sessions.
//
// This script covers the other half: accessibility, via the real
// Lighthouse CLI, on two unauthenticated pages. Authenticated routes get
// their accessibility coverage from axe-core instead (tests/e2e/
// onboarding.spec.ts), inside sessions that are already logged in -
// driving Lighthouse CLI against an authenticated route means minting
// and passing a session cookie through --extra-headers, not worth it
// for a one-off spot check.
import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
// Calling lighthouse's own CLI entry directly via node, not `npx
// lighthouse` through a shell - avoids both the extra npx resolution
// step and Node's shell-arg-escaping deprecation warning.
const LIGHTHOUSE_CLI = fileURLToPath(new URL("../node_modules/lighthouse/cli/index.js", import.meta.url));
const BASE_URL = "http://localhost:3000";
const OUT_DIR = ".lighthouse";
const MIN_SCORE = 0.9;

const pages = [
  { path: "/", label: "home" },
  { path: "/login", label: "login" },
];

async function checkServerUp() {
  try {
    const res = await fetch(BASE_URL, { method: "GET" });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await checkServerUp())) {
    console.error(`No server responding at ${BASE_URL} - run \`npm run dev\` first.`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  let failed = false;

  for (const { path, label } of pages) {
    const outputPath = `${OUT_DIR}/${label}.json`;
    console.log(`\nRunning Lighthouse (accessibility) against ${BASE_URL}${path} ...`);

    const { stdout, stderr } = await run(
      process.execPath,
      [
        LIGHTHOUSE_CLI,
        `${BASE_URL}${path}`,
        "--only-categories=accessibility",
        "--chrome-flags=--headless=new --no-sandbox",
        "--output=json",
        `--output-path=${outputPath}`,
        "--quiet",
      ],
      { maxBuffer: 1024 * 1024 * 20 },
    ).catch((err) => {
      console.error(`Lighthouse run against ${path} failed:`, err.stderr || err.message);
      process.exit(1);
    });
    if (stderr && stderr.trim()) console.error(stderr.trim());
    if (stdout && stdout.trim()) console.log(stdout.trim());

    const { readFile } = await import("node:fs/promises");
    const report = JSON.parse(await readFile(outputPath, "utf-8"));
    const score = report.categories.accessibility.score;
    const pct = Math.round(score * 100);
    const pass = score >= MIN_SCORE;
    failed = failed || !pass;

    console.log(`${pass ? "PASS" : "FAIL"} ${path} accessibility: ${pct}/100 (report: ${outputPath})`);

    if (!pass) {
      const failing = Object.values(report.audits).filter(
        (a) => a.score !== null && a.score < 1 && report.categories.accessibility.auditRefs.some((r) => r.id === a.id),
      );
      for (const audit of failing) {
        console.log(`  - ${audit.id}: ${audit.title}`);
      }
    }
  }

  if (failed) {
    console.error(`\nOne or more pages scored below ${MIN_SCORE * 100}/100 on accessibility.`);
    process.exit(1);
  }
  console.log("\nAll pages pass the accessibility threshold.");
}

main();
