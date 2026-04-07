import { test, expect } from "@playwright/test";

// ─── API stubs used across tests ──────────────────────────────────────────────

const MOCK_QUOTE = { rate: 1580, fiatAmount: 1580, fiatCurrency: "NGN" };
const MOCK_SETTLEMENT_REF =
  "0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1";
const MOCK_ORDER_RESPONSE = {
  success: true,
  data: {
    id: "order_test_1",
    settlementRef: MOCK_SETTLEMENT_REF,
    fiatAmount: 1580,
    rate: 1580,
    fiatCurrency: "NGN",
    status: "PENDING",
    guestCheckout: true,
  },
};

async function stubBackendRoutes(page: Parameters<typeof test>[1] extends { page: infer P } ? P : never) {
  await page.route("**/api/quotes**", (route) =>
    route.fulfill({ status: 200, json: { success: true, data: MOCK_QUOTE } })
  );
  await page.route("**/api/rates**", (route) =>
    route.fulfill({ status: 200, json: { success: true, data: { NGN: 1580 } } })
  );
  await page.route("**/api/bank/verify-account**", (route) =>
    route.fulfill({
      status: 200,
      json: {
        success: true,
        data: { accountName: "JOHN DOE", bankName: "GTBank" },
      },
    })
  );
  await page.route("**/api/orders", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({ status: 201, json: MOCK_ORDER_RESPONSE });
    }
    return route.continue();
  });
  await page.route(`**/api/orders/${MOCK_SETTLEMENT_REF}`, (route) =>
    route.fulfill({
      status: 200,
      json: { success: true, data: { ...MOCK_ORDER_RESPONSE.data, status: "SETTLED" } },
    })
  );
}

// ─── Smoke test ───────────────────────────────────────────────────────────────

test.describe("page load", () => {
  test("renders connect wallet step on first visit", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Connect Wallet")).toBeVisible({ timeout: 10_000 });
  });
});

// ─── BankAccountForm NUBAN validation ────────────────────────────────────────

test.describe("NUBAN validation (clientside)", () => {
  test.beforeEach(async ({ page }) => {
    await stubBackendRoutes(page);
  });

  /**
   * To reach the bank step we inject a pre-connected wagmi state into
   * sessionStorage (wagmi v2 persists to localStorage/sessionStorage).
   * The app reads this on mount and skips the connect gate.
   */
  test("shows error for short account number", async ({ page }) => {
    await page.goto("/");

    // Inject a synthetic connected-wallet signal so the flow advances past connect.
    // wagmi v2 stores its state under "wagmi.store" in localStorage.
    await page.evaluate(() => {
      const FAKE_ADDRESS = "0x1234567890123456789012345678901234567890";
      // wagmi v2 uses @wagmi/core internals; we patch the exposed store key
      // so useAccount() returns a connected state on next React render.
      try {
        const raw = localStorage.getItem("wagmi.store");
        const store = raw ? JSON.parse(raw) : { state: {} };
        store.state.connections = {
          __type: "Map",
          value: [
            [
              "injected",
              {
                accounts: [FAKE_ADDRESS],
                chainId: 84532,
                connector: { id: "injected", name: "Injected", type: "injected" },
              },
            ],
          ],
        };
        store.state.current = "injected";
        store.state.status = "connected";
        localStorage.setItem("wagmi.store", JSON.stringify(store));
      } catch {
        // storage unavailable — test will degrade gracefully
      }
    });

    await page.reload();

    // Skip ahead to the bank step by clicking Next on the amount step
    const nextBtn = page.locator('button:has-text("Next")').first();
    await nextBtn.waitFor({ state: "visible", timeout: 8_000 });
    await nextBtn.click();

    // Now on bank step — type a 9-digit account number (invalid NUBAN)
    const accountInput = page.locator('input[inputmode="numeric"]');
    await accountInput.waitFor({ state: "visible", timeout: 5_000 });
    await accountInput.fill("123456789"); // 9 digits — should show error

    await expect(
      page.locator("text=Account number must be 10 digits")
    ).toBeVisible({ timeout: 3_000 });
  });

  test("resolves and shows account name for valid 10-digit NUBAN", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => {
      const FAKE_ADDRESS = "0x1234567890123456789012345678901234567890";
      try {
        const raw = localStorage.getItem("wagmi.store");
        const store = raw ? JSON.parse(raw) : { state: {} };
        store.state.connections = {
          __type: "Map",
          value: [
            [
              "injected",
              {
                accounts: [FAKE_ADDRESS],
                chainId: 84532,
                connector: { id: "injected", name: "Injected", type: "injected" },
              },
            ],
          ],
        };
        store.state.current = "injected";
        store.state.status = "connected";
        localStorage.setItem("wagmi.store", JSON.stringify(store));
      } catch {}
    });

    await page.reload();

    const nextBtn = page.locator('button:has-text("Next")').first();
    await nextBtn.waitFor({ state: "visible", timeout: 8_000 });
    await nextBtn.click();

    const accountInput = page.locator('input[inputmode="numeric"]');
    await accountInput.waitFor({ state: "visible", timeout: 5_000 });
    await accountInput.fill("0123456789"); // valid 10-digit NUBAN

    // Account name should be resolved from mocked /api/bank/verify-account
    await expect(page.locator("text=JOHN DOE")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("text=Account number must be 10 digits")).not.toBeVisible();
  });
});
