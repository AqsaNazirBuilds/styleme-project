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
  await page.getByLabel("Name").fill("E2E Planner User");
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

async function buildOutfit(page: import("@playwright/test").Page, name: string) {
  await page.goto("/outfits/new");
  await expect(page.getByRole("heading", { name: /build an outfit/i })).toBeVisible({
    timeout: 20_000,
  });

  await page.getByLabel("Name").fill(name);

  const itemButtons = page.locator("button").filter({ has: page.locator("img") });
  await expect(itemButtons).toHaveCount(2, { timeout: 15_000 });
  await itemButtons.nth(0).click();
  await itemButtons.nth(1).click();

  await page.getByRole("button", { name: /save outfit/i }).click();
  await expect(page).toHaveURL(/\/outfits$/, { timeout: 20_000 });
}

test.describe("Planner", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await registerAndLogin(page);

    await addWardrobeItem(page, `E2E Planner Top ${Date.now()}`, 0);
    await addWardrobeItem(page, `E2E Planner Bottom ${Date.now()}`, 1);
  });

  test("a user can schedule an outfit to a date", async ({ page }) => {
    test.setTimeout(90_000);

    const outfitName = `E2E Planner Outfit ${Date.now()}`;
    await buildOutfit(page, outfitName);

    await page.goto("/planner");
    await expect(page.getByRole("heading", { name: /outfit planner/i })).toBeVisible({
      timeout: 20_000,
    });

    const dayButtons = page.locator("button").filter({ hasText: /^\d+$/ });
    await dayButtons.first().click();

    await page.getByRole("combobox", { name: /select an outfit/i }).click();
    await page.getByRole("option", { name: outfitName }).click();

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/calendar") && res.request().method() === "POST"
      ),
      page.getByRole("button", { name: /^schedule$/i }).click(),
    ]);
    expect(response.ok()).toBeTruthy();

    // Scheduling closes the day panel — reopen the same day to verify it saved
    await dayButtons.first().click();
    await expect(page.getByText(outfitName)).toBeVisible({ timeout: 15_000 });
  });

  test("a user can remove a scheduled outfit", async ({ page }) => {
    test.setTimeout(90_000);

    const outfitName = `E2E Planner Remove ${Date.now()}`;
    await buildOutfit(page, outfitName);

    await page.goto("/planner");
    await expect(page.getByRole("heading", { name: /outfit planner/i })).toBeVisible({
      timeout: 20_000,
    });

    const dayButtons = page.locator("button").filter({ hasText: /^\d+$/ });
    await dayButtons.first().click();

    await page.getByRole("combobox", { name: /select an outfit/i }).click();
    await page.getByRole("option", { name: outfitName }).click();

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/calendar") && res.request().method() === "POST"
      ),
      page.getByRole("button", { name: /^schedule$/i }).click(),
    ]);
    expect(response.ok()).toBeTruthy();

    // Reopen the day panel (schedule closes it)
    await dayButtons.first().click();
    await expect(page.getByText(outfitName)).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: new RegExp(`remove.*${outfitName}`, "i") }).click();

    await expect(page.getByText(outfitName)).not.toBeVisible({ timeout: 15_000 });
  });
});