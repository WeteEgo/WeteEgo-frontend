/**
 * Rates & quotes — fetches from WeteEgo-backend API.
 * Falls back to hardcoded placeholders if the API is unavailable.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const FALLBACK_RATES: Record<string, number> = {
  NGN: 1_550,
  USD: 1,
};

export interface QuoteResult {
  usdcAmount: number;
  fiatCurrency: string;
  fiatAmount: number;
  rate: number;
  source: "api" | "fallback";
}

export async function fetchQuote(
  usdcAmount: number,
  fiatCurrency: string
): Promise<QuoteResult> {
  if (API_URL) {
    try {
      const res = await fetch(
        `${API_URL}/api/quotes?amount=${usdcAmount}&fiat=${fiatCurrency}`
      );
      if (res.ok) {
        const json = (await res.json()) as {
          success: boolean;
          data: { fiatAmount: number; rate: number; fiatCurrency: string };
        };
        if (json.success) {
          return { ...json.data, usdcAmount, source: "api" };
        }
      }
    } catch {
      // fall through to placeholder
    }
  }

  const rate = FALLBACK_RATES[fiatCurrency.toUpperCase()] ?? 1;
  return {
    usdcAmount,
    fiatCurrency: fiatCurrency.toUpperCase(),
    fiatAmount: usdcAmount * rate,
    rate,
    source: "fallback",
  };
}

/** Kept for backward compatibility. */
export function getPlaceholderRate(fiatCurrency: string): number {
  return FALLBACK_RATES[fiatCurrency] ?? 1;
}

export function formatQuote(usdcAmount: number, fiatCurrency: string): string {
  const rate = getPlaceholderRate(fiatCurrency);
  const fiatAmount = usdcAmount * rate;
  return `≈ ${fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${fiatCurrency}`;
}
