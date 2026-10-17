import { test, expect } from "@playwright/test";
import { signUpAndConfirm } from "./helpers/auth";

// docs/tasks.md Day 9: "free plan blocks 6th seat". Enforced by a DB
// trigger (supabase/migrations/20261013140330_invitations.sql,
// check_seat_limit) that counts workspace_members + pending invitations -
// pending invitations count toward the limit even unaccepted, so this
// needs only one real signup, not one per seat.
test("free plan blocks inviting a 6th seat", async ({ page }) => {
  const stamp = Date.now();
  const owner = { email: `e2e-${stamp}-seats-owner@example.com`, password: "TestPass123!", fullName: "E2E Seats Owner" };
  const slug = `e2e-seats-${stamp}`;

  await signUpAndConfirm(page, owner);

  await page.goto("/workspaces");
  await page.fill('input[name="name"]', "E2E Seats Workspace");
  await page.fill('input[name="slug"]', slug);
  await page.click('button:has-text("Create workspace")');
  await expect(page).toHaveURL(new RegExp(`/w/${slug}$`));

  await page.goto(`/w/${slug}/members`);

  // Owner already occupies seat 1. Invitations 2-5 fill the remaining
  // seats on the Free plan (5 total) - none need to be accepted, since
  // workspace_seat_count() counts pending invitations too.
  for (let seat = 2; seat <= 5; seat++) {
    await page.click("text=Invite people");
    await page.fill("#invite-email", `e2e-${stamp}-seat${seat}@example.com`);
    await page.click('button:has-text("Send invite")');
    await expect(page.locator(`text=e2e-${stamp}-seat${seat}@example.com`)).toBeVisible({ timeout: 5000 });
  }

  // The 6th invitation should be blocked.
  await page.click("text=Invite people");
  await page.fill("#invite-email", `e2e-${stamp}-seat6@example.com`);
  await page.click('button:has-text("Send invite")');
  await expect(page.locator("text=You've reached the free plan's 5-seat limit.")).toBeVisible({ timeout: 5000 });

  // The 6th invitee must not have been added.
  await expect(page.locator(`text=e2e-${stamp}-seat6@example.com`)).toHaveCount(0);
});
