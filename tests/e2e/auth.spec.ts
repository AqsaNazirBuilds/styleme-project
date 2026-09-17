import { test, expect } from "@playwright/test";

const uniqueEmail = () => `test-${Date.now()}@example.com`;

test.describe("Authentication", () => {
  test("a user can register, then log in, and reaches the dashboard", async ({ page }) => {
    const email = uniqueEmail();
    const password = "password123";

    await page.goto("/register");
    await page.getByLabel("Name").fill("E2E Test User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/(quiz|dashboard)/);
  });

  test("an unauthenticated user is redirected away from a protected route", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("logging in with the wrong password shows an error, not a crash", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nonexistent@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });
});