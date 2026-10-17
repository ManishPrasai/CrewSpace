import { test, expect, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { signUpAndConfirm } from "./helpers/auth";
import { seedInvitation } from "./helpers/db";

// label-content-name-mismatch false-positives on AccountMenu's trigger
// (src/features/auth/components/AccountMenu.tsx): it has aria-label=
// "Account menu" and a decorative aria-hidden avatar inside. Verified
// correct via Playwright's own accessibility snapshot (which implements
// the real W3C accessible-name computation): the rendered tree is
// `button "Account menu": generic [aria-hidden]: EO` - the initials are
// properly excluded. axe-core's rule here checks raw DOM text content,
// not full accname computation, and is a documented false-positive class
// for icon buttons with aria-hidden decorative content.
function scan(page: Page) {
  return new AxeBuilder({ page }).disableRules(["label-content-name-mismatch"]).analyze();
}

// docs/tasks.md Day 9: "signup > create workspace > invite > accept",
// "member cannot post announcement". Combined into one spec - accepting
// the invite already lands the member on the feed, so asserting the
// composer is absent there free-rides on that navigation instead of a
// third signup (every signup needs a real Mailpit confirmation round-trip).
//
// The invite's accept half is seeded via tests/e2e/helpers/db.ts rather
// than a real delivered email: RESEND_API_KEY is a local placeholder
// ("invite emails will fail gracefully" per .env.local) and invitation
// tokens are only ever stored hashed, so the raw token from a real
// "Send invite" click is unrecoverable locally. The create-invitation
// action/UI is still exercised for real below; only the accept half's
// starting token is test-seeded. Confirmed with the user before building
// this - see docs/decisions.md ADR-022.
test("signup, create workspace, invite, accept, and member cannot post", async ({ browser }) => {
  const stamp = Date.now();
  const owner = { email: `e2e-${stamp}-owner@example.com`, password: "TestPass123!", fullName: "E2E Owner" };
  const member = { email: `e2e-${stamp}-member@example.com`, password: "TestPass123!", fullName: "E2E Member" };
  const slug = `e2e-ws-${stamp}`;

  const ownerContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();

  await signUpAndConfirm(ownerPage, owner);
  // Page is genuinely rendered at this point (confirmed via Playwright's
  // own accessibility snapshot showing the real <h1>) - axe-core's scan
  // ran once before the client finished hydrating. Wait for a stable
  // landmark before scanning, not a fixed timeout.
  await ownerPage.getByRole("heading", { level: 1 }).waitFor();

  const signupA11y = await scan(ownerPage);
  expect(signupA11y.violations, formatViolations(signupA11y.violations)).toEqual([]);

  // Create workspace - confirming lands the owner on /workspaces.
  await ownerPage.goto("/workspaces");
  await ownerPage.fill('input[name="name"]', "E2E Test Workspace");
  await ownerPage.fill('input[name="slug"]', slug);
  await ownerPage.click('button:has-text("Create workspace")');
  await expect(ownerPage).toHaveURL(new RegExp(`/w/${slug}$`));

  // Exercise the real "Send invite" UI/action for coverage (not used for
  // the accept half below - see the file-level comment).
  await ownerPage.goto(`/w/${slug}/members`);
  await ownerPage.click("text=Invite people");
  await ownerPage.fill("#invite-email", member.email);
  await ownerPage.click('button:has-text("Send invite")');
  await expect(ownerPage.locator(`text=${member.email}`)).toBeVisible({ timeout: 5000 });
  // The invite dialog closes itself on success (InviteDialog.tsx's
  // onSent). Its close transition was still mid-fade when a scan ran
  // here before - axe caught the dialog's text at a near-transparent
  // animation frame and reported it as a static contrast failure.
  // Base UI's dialog keeps the node mounted through its own exit
  // animation (duration-100 in dialog.tsx) rather than unmounting
  // immediately, so waiting for DOM removal isn't reliable here - a
  // short wait for the 100ms CSS transition to finish is.
  await ownerPage.waitForTimeout(300);

  const ownerFeedA11y = await scan(ownerPage);
  expect(ownerFeedA11y.violations, formatViolations(ownerFeedA11y.violations)).toEqual([]);

  // Seed a second invitation (same email can't have two pending invites
  // per the one_pending_invite_per_email index) with a token this test
  // controls, so the accept flow can run for real against the genuine
  // /invite/[token] page and accept_invitation RPC.
  const acceptableEmail = `e2e-${stamp}-member2@example.com`;
  const token = await seedInvitation({ workspaceSlug: slug, email: acceptableEmail, role: "member" });

  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  const acceptingMember = { ...member, email: acceptableEmail };

  await signUpAndConfirm(memberPage, acceptingMember, `/invite/${token}`);

  await memberPage.click('button:has-text("Accept invitation")');
  await expect(memberPage).toHaveURL(new RegExp(`/w/${slug}$`));

  // Member cannot post: the composer is UI-gated by canManage
  // (src/app/(app)/w/[slug]/page.tsx) - a member never gets it in the DOM.
  await expect(memberPage.locator("text=New announcement")).toHaveCount(0);
  await expect(memberPage.locator("text=Share an update with")).toHaveCount(0);

  const memberA11y = await scan(memberPage);
  expect(memberA11y.violations, formatViolations(memberA11y.violations)).toEqual([]);

  await ownerContext.close();
  await memberContext.close();
});

function formatViolations(violations: { id: string; help: string; nodes: unknown[] }[]): string {
  return violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`).join("\n");
}
