import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { confirmEmailFor } from "./mail";

export type NewUser = {
  email: string;
  password: string;
  fullName: string;
};

// Fills /signup, waits for the "check your email" success swap
// (src/features/auth/components/SignUpForm.tsx), then confirms via the
// real Mailpit round-trip - leaves `page` logged in afterward.
export async function signUpAndConfirm(page: Page, user: NewUser, next?: string): Promise<void> {
  const signupUrl = next ? `/signup?next=${encodeURIComponent(next)}&email=${encodeURIComponent(user.email)}` : "/signup";
  await page.goto(signupUrl);

  const emailInput = page.locator('input[name="email"]');
  if (!(await emailInput.inputValue())) {
    await emailInput.fill(user.email);
  }
  await page.fill('input[name="fullName"]', user.fullName);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');

  await expect(page.getByRole("status")).toHaveText("Check your email to confirm your account.");

  await confirmEmailFor(page, user.email);
}
