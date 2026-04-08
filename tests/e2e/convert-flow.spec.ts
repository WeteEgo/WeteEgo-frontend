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

const E2E_WALLET = "0x1234567890123456789012345678901234567890";
/** Base Sepolia chain id */
const CHAIN_ID_HEX = "0x14a34";

async function installMockEthereum(page: import("@playwright/test").Page) {
  await page.addInitScript(
    ([addr, chainHex]: [string, string]) => {
      const provider = {
        isMetaMask: true,
        request: async ({ method }: { method: string }) => {
          if (method === "eth_requestAccounts" || method === "eth_accounts") return [addr];
          if (method === "eth_chainId") return chainHex;
          if (method === "net_version") return String(parseInt(chainHex, 16));
          return null;
        },
        on: () => provider,
        removeListener: () => provider,
      };
      (window as unknown as { ethereum?: typeof provider }).ethereum = provider;
    },
    [E2E_WALLET, CHAIN_ID_HEX] as [string, string]
  );
}

async function connectWalletThroughUi(page: import("@playwright/test").Page) {
  const connectBtn = page.getByRole("button", { name: /^injected$/i }).first();
  await connectBtn.click();
  // Amount step uses "Continue" (not "Next") and is shown after connect.
  await page.getByPlaceholder("0.00").waitFor({ state: "visible", timeout: 20_000 });
}

/** Amount step requires a positive USDC value before Continue is enabled. */
async function continueFromAmountToBank(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("0.00").fill("1");
  await page.getByRole("button", { name: /^continue$/i }).click();
}

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
  test("renders connect wallet step on first visit to /convert", async ({ page }) => {
    await page.goto("/convert");
    await expect(
      page.getByRole("heading", { name: /connect your wallet/i })
    ).toBeVisible({ timeout: 15_000 });
  });
});

// ─── BankAccountForm NUBAN validation ────────────────────────────────────────

test.describe("NUBAN validation (clientside)", () => {
  test.beforeEach(async ({ page }) => {
    await installMockEthereum(page);
    await stubBackendRoutes(page);
  });

  /**
   * wagmi v2 + zustand persist expects a specific `wagmi.store` shape; seeding it
   * manually is brittle. We mock `window.ethereum` and use the real Connect button.
   */
  test("shows error for short account number", async ({ page }) => {
    await page.goto("/convert");
    await connectWalletThroughUi(page);
    await continueFromAmountToBank(page);

    // Now on bank step — type a 9-digit account number (invalid NUBAN)
    const accountInput = page.locator('input[inputmode="numeric"]');
    await accountInput.waitFor({ state: "visible", timeout: 5_000 });
    await accountInput.fill("123456789"); // 9 digits — should show error

    await expect(
      page.locator("text=Account number must be 10 digits")
    ).toBeVisible({ timeout: 3_000 });
  });

  test("resolves and shows account name for valid 10-digit NUBAN", async ({ page }) => {
    await page.goto("/convert");
    await connectWalletThroughUi(page);
    await continueFromAmountToBank(page);

    const accountInput = page.locator('input[inputmode="numeric"]');
    await accountInput.waitFor({ state: "visible", timeout: 5_000 });
    await accountInput.fill("0123456789"); // valid 10-digit NUBAN

    // Account name should be resolved from mocked /api/bank/verify-account
    await expect(page.locator("text=JOHN DOE")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("text=Account number must be 10 digits")).not.toBeVisible();
  });
});
