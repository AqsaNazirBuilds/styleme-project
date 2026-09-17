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
  await page.getByLabel("Name").fill("E2E Wardrobe User");
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

test.describe("Wardrobe", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await registerAndLogin(page);
  });

  test("a user can add an item and see it in the wardrobe grid", async ({ page }) => {
    const itemName = `E2E Test Shirt ${Date.now()}`;
    await addWardrobeItem(page, itemName);

    await expect(page.getByText(itemName)).toBeVisible();
  });

  test("a user can edit an existing item", async ({ page }) => {
    test.setTimeout(60_000);

    const originalName = `E2E Edit Source ${Date.now()}`;
    await addWardrobeItem(page, originalName);

    await page.getByRole("link", { name: new RegExp(originalName) }).click();
    await expect(page).toHaveURL(/\/wardrobe\/[^/]+$/, { timeout: 20_000 });

    await page.getByRole("button", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/edit$/, { timeout: 20_000 });

    await expect(page.getByLabel("Name")).toBeVisible({ timeout: 30_000 });
    const updatedName = `E2E Edited ${Date.now()}`;
    await page.getByLabel("Name").fill(updatedName);
    await page.getByRole("button", { name: /save changes/i }).click();

    await expect(page.getByRole("heading", { name: updatedName })).toBeVisible({ timeout: 20_000 });
  });

  test("a user can delete an item", async ({ page }) => {
    test.setTimeout(60_000);

    const itemName = `E2E Delete Me ${Date.now()}`;
    await addWardrobeItem(page, itemName);

    await page.getByRole("link", { name: new RegExp(itemName) }).click();
    await expect(page).toHaveURL(/\/wardrobe\/[^/]+$/, { timeout: 20_000 });

    await page.getByRole("button", { name: "Delete item" }).click();
    await page.getByRole("button", { name: /yes, delete/i }).click();

    await expect(page).toHaveURL(/\/wardrobe$/, { timeout: 20_000 });
    await expect(page.getByText(itemName)).not.toBeVisible();
  });
});