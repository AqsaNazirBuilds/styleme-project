import { test, expect } from "@playwright/test";

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

async function registerAndLogin(page: import("@playwright/test").Page) {
  const email = uniqueEmail();
  const password = "password123";

  await page.goto("/register");
  await page.getByLabel("Name").fill("Security Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/(quiz|dashboard)/, { timeout: 15_000 });

  return { email, password };
}

test.describe("Cross-user security", () => {
  test("a user cannot access another user's wardrobe item by ID", async ({ browser }) => {
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await registerAndLogin(pageA);

    // User A adds an item via the API directly (faster than the full upload UI for this test)
    const responseA = await pageA.request.post("/api/wardrobe", {
      multipart: {
        name: "User A Private Item",
        category: "Tops",
        color: "Black",
        image: {
          name: "test.png",
          mimeType: "image/png",
          buffer: Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            "base64"
          ),
        },
      },
    });
    expect(responseA.ok()).toBeTruthy();
    const itemA = (await responseA.json()).data;

    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await registerAndLogin(pageB);

    // User B tries to access User A's item directly by ID
    const responseB = await pageB.request.get(`/api/wardrobe/${itemA.id}`);
    expect(responseB.status()).toBe(404);

    await contextA.close();
    await contextB.close();
  });

  test("a non-admin user is redirected away from /admin", async ({ page }) => {
    await registerAndLogin(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });
});