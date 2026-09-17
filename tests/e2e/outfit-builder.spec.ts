import { test, expect } from "@playwright/test";

const uniqueEmail = () => `test-${Date.now()}@example.com`;

const testImage = {
  name: "test-item.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
  ),
};

async function registerAndLogin(page: import("@playwright/test").Page) {
  const email = uniqueEmail();
  const password = "password123";

  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Outfit User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/(quiz|dashboard)/, { timeout: 20_000 });
}

async function addWardrobeItem(page: import("@playwright/test").Page, name: string) {
  await page.goto("/wardrobe/add");
  await page.getByLabel("Name").fill(name);
  await page.setInputFiles('input[type="file"]', testImage);

  await page.getByRole("combobox", { name: "Category" }).click();
  await page.getByRole("option").first().click();

  await page.getByRole("combobox", { name: "Color" }).click();
  await page.getByRole("option").first().click();

  await page.getByRole("button", { name: /add to wardrobe/i }).click();
  await expect(page).toHaveURL(/\/wardrobe$/, { timeout: 20_000 });
}

test.describe("Outfit builder", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await registerAndLogin(page);

    await addWardrobeItem(page, `E2E Outfit Top ${Date.now()}`);
    await addWardrobeItem(page, `E2E Outfit Bottom ${Date.now()}`);
  });

  test("a user can select items and see a compatibility score", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/outfits/new");
    await expect(page.getByRole("heading", { name: /build an outfit/i })).toBeVisible({
      timeout: 20_000,
    });

    const itemButtons = page.locator("button").filter({ has: page.locator("img") });
    await expect(itemButtons).toHaveCount(2, { timeout: 15_000 });

    await itemButtons.nth(0).click();
    await itemButtons.nth(1).click();

   await expect(page.getByText("Style Match", { exact: true })).toBeVisible({ timeout: 10_000 });
   await expect(page.getByText(/\d+%/).first()).toBeVisible();
  });

  test("a user can save a built outfit", async ({ page }) => {
    test.setTimeout(90_000);

    const outfitName = `E2E Outfit ${Date.now()}`;

    await page.goto("/outfits/new");
    await expect(page.getByRole("heading", { name: /build an outfit/i })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByLabel("Name").fill(outfitName);

    const itemButtons = page.locator("button").filter({ has: page.locator("img") });
    await expect(itemButtons).toHaveCount(2, { timeout: 15_000 });
    await itemButtons.nth(0).click();
    await itemButtons.nth(1).click();

    await page.getByRole("button", { name: /save outfit/i }).click();

    await expect(page).toHaveURL(/\/outfits$/, { timeout: 20_000 });
    await expect(page.getByText(outfitName)).toBeVisible({ timeout: 15_000 });
  });
});