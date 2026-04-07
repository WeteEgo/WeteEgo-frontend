"use client";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import type { QuoteResult } from "@/lib/rates";

interface EnterAmountStepProps {
  amount: string;
  fiatCurrency: string;
  quote: QuoteResult | null;
  onAmountChange: (v: string) => void;
  onCurrencyChange: (v: string) => void;
  onNext: () => void;
}

export function EnterAmountStep({
  amount,
  fiatCurrency,
  quote,
  onAmountChange,
  onCurrencyChange,
  onNext,
}: EnterAmountStepProps) {
  const usdcNum = Number(amount);
  const valid = amount && !isNaN(usdcNum) && usdcNum > 0;

  const receiveLabel = quote
    ? `${quote.fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${quote.fiatCurrency}`
    : "---";

  const rateLabel = quote
    ? `1 USDC = ${quote.rate.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${quote.fiatCurrency}`
    : null;

  return (
    <div className="space-y-5 animate-[fadeUp_0.2s_ease-out]">
      {/* Send */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wider">
          You send
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)]/60 bg-slate-900/40 px-4 py-3">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="flex-1 border-0 bg-transparent text-xl font-semibold text-slate-100 p-0 focus:ring-0 focus:outline-none"
          />
          <span className="shrink-0 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-medium text-blue-300">
            USDC
          </span>
        </div>
      </div>

      {/* Receive */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400 uppercase tracking-wider">
          They receive
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)]/60 bg-slate-900/40 px-4 py-3">
          <span className="text-xl font-semibold text-slate-100 flex-1 truncate">
            {valid ? receiveLabel : "---"}
          </span>
          <Select
            value={fiatCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="border-0 bg-emerald-500/10 text-emerald-300 text-xs font-medium rounded-full px-3 py-1 w-auto"
          >
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
          </Select>
        </div>
      </div>

      {/* Rate info */}
      {rateLabel && (
        <p className="text-center text-xs text-[var(--text-muted)]">
          {rateLabel}
          {quote?.source === "fallback" && (
            <span className="ml-1 text-amber-400">(estimated)</span>
          )}
        </p>
      )}

      {Number(amount) > 500 && (
        <Alert variant="warning">
          Orders over $500 require identity verification (KYC).
        </Alert>
      )}

      <Button
        className="w-full"
        onClick={onNext}
        disabled={!valid}
      >
        Continue
      </Button>
    </div>
  );
}
