import { test, expect } from "@playwright/test";

test("marketing home loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("convert page shows wallet connect step", async ({ page }) => {
  await page.goto("/convert");
  await expect(
    page.getByRole("heading", { name: /connect your wallet/i })
  ).toBeVisible();
});
