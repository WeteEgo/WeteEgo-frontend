import { test, expect } from "@playwright/test";

test("admin page prompts for key or shows orders UI", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /weteego admin/i })).toBeVisible();
  await expect(
    page.getByText(/admin key|orders/i).first()
  ).toBeVisible();
});
