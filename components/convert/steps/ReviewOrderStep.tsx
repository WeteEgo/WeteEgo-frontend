"use client";

import type { QuoteResult } from "@/lib/rates";
import type { BankAccount } from "@/components/BankAccountForm";
import { NIGERIAN_BANKS } from "@/components/BankAccountForm";
import { Button } from "@/components/ui/button";
import { QuoteBar } from "@/components/convert/shared/QuoteBar";

interface ReviewOrderStepProps {
  amount: string;
  fiatCurrency: string;
  bankAccount: BankAccount;
  quote: QuoteResult | null;
  secondsLeft: number | null;
  isRefetching: boolean;
  expired: boolean;
  onRefetch: () => void;
  onConfirm: () => void;
  onBack: () => void;
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className={`text-sm font-medium text-slate-100 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export function ReviewOrderStep({
  amount,
  fiatCurrency,
  bankAccount,
  quote,
  secondsLeft,
  isRefetching,
  expired,
  onRefetch,
  onConfirm,
  onBack,
}: ReviewOrderStepProps) {
  const bankName = NIGERIAN_BANKS.find((b) => b.code === bankAccount.bankCode)?.name ?? bankAccount.bankCode;
  const receiveAmount = quote
    ? quote.fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "---";

  return (
    <div className="space-y-4 animate-[fadeUp_0.2s_ease-out]">
      <div>
        <h3 className="text-sm font-medium text-slate-200">Review your conversion</h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Confirm the details below before proceeding.
        </p>
      </div>

      <QuoteBar
        quote={quote}
        secondsLeft={secondsLeft}
        isRefetching={isRefetching}
        onRefetch={onRefetch}
      />

      <div className="rounded-lg border border-[var(--border-subtle)]/60 bg-slate-900/30 px-4">
        <SummaryRow label="You send" value={`${amount} USDC`} />
        <SummaryRow label="They receive" value={`${receiveAmount} ${fiatCurrency}`} />
        <SummaryRow label="Bank" value={bankName} />
        <SummaryRow label="Account" value={bankAccount.accountNumber} mono />
        <SummaryRow label="Account name" value={bankAccount.accountName} />
        <SummaryRow label="Fee" value="0 USDC" />
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={onConfirm}
          disabled={expired}
        >
          {expired ? "Quote expired — refresh to continue" : "Confirm & continue"}
        </Button>
      </div>
    </div>
  );
}
