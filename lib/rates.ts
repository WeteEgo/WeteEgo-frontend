/**
 * Placeholder rates for USDC → fiat (Phase 2 Option A).
 * Replace with API call (e.g. WeteEgo-rates or Paycrest/partner) when available.
 */
const PLACEHOLDER_RATES: Record<string, number> = {
  NGN: 1_550,
  USD: 1,
};

export function getPlaceholderRate(fiatCurrency: string): number {
  return PLACEHOLDER_RATES[fiatCurrency] ?? 1;
}

export function formatQuote(usdcAmount: number, fiatCurrency: string): string {
  const rate = getPlaceholderRate(fiatCurrency);
  const fiatAmount = usdcAmount * rate;
  return `≈ ${fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${fiatCurrency}`;
}
