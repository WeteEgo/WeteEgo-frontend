"use client";

import BankAccountForm, {
  type BankAccount,
  isBankAccountValid,
} from "@/components/BankAccountForm";
import { Button } from "@/components/ui/button";

interface BankDetailsStepProps {
  bankAccount: BankAccount;
  onChange: (v: BankAccount) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BankDetailsStep({ bankAccount, onChange, onNext, onBack }: BankDetailsStepProps) {
  return (
    <div className="space-y-5 animate-[fadeUp_0.2s_ease-out]">
      <div>
        <h3 className="text-sm font-medium text-slate-200">Recipient bank account</h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Enter the Nigerian bank account to receive NGN.
        </p>
      </div>

      <BankAccountForm value={bankAccount} onChange={onChange} />

      <div className="flex gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={onNext}
          disabled={!isBankAccountValid(bankAccount)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
