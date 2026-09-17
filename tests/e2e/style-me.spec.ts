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
  await page.getByLabel("Name").fill("E2E Style Me User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/(quiz|dashboard)/, { timeout: 20_000 });
}

async function addWardrobeItem(
  page: import("@playwright/test").Page,
  name: string,
  categoryIndex = 0
) {
  await page.goto("/wardrobe/add");
  await page.getByLabel("Name").fill(name);
  await page.setInputFiles('input[type="file"]', testImage);

  await page.getByRole("combobox", { name: "Category" }).click();
  await page.getByRole("option").nth(categoryIndex).click();

  await page.getByRole("combobox", { name: "Color" }).click();
  await page.getByRole("option").first().click();

  await page.getByRole("button", { name: /add to wardrobe/i }).click();
  await expect(page).toHaveURL(/\/wardrobe$/, { timeout: 20_000 });
}

test.describe("Style Me", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120_000);
    await registerAndLogin(page);

    await addWardrobeItem(page, `E2E StyleMe Top ${Date.now()}`, 0);
    await addWardrobeItem(page, `E2E StyleMe Bottom ${Date.now()}`, 1);
  });

  test("a user can generate a look and see a result", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/style-me");
    await expect(page.getByRole("heading", { name: /where are you going/i })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole("button", { name: /casual/i }).click();

    await expect(page.getByRole("heading", { name: /how do you want to look/i })).toBeVisible({
      timeout: 10_000,
    });

    const styleButtons = page.locator('button[class*="rounded-full"]');
    await styleButtons.first().click();

    await page.getByRole("button", { name: /generate look/i }).click();

    await expect(page.getByRole("heading", { name: /style me result/i })).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText(/\d+%/).first()).toBeVisible();
  });

  test("a user can save a generated look as an outfit", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/style-me");
    await expect(page.getByRole("heading", { name: /where are you going/i })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole("button", { name: /casual/i }).click();

    await expect(page.getByRole("heading", { name: /how do you want to look/i })).toBeVisible({
      timeout: 10_000,
    });

    const styleButtons = page.locator('button[class*="rounded-full"]');
    await styleButtons.first().click();

    await page.getByRole("button", { name: /generate look/i }).click();

    await expect(page.getByRole("heading", { name: /style me result/i })).toBeVisible({
      timeout: 60_000,
    });

    await page.getByRole("button", { name: /save outfit/i }).click();

    await expect(page).toHaveURL(/\/outfits$/, { timeout: 20_000 });
  });
});