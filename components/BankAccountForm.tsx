"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export const NIGERIAN_BANKS = [
  { code: "GTBINGLA", name: "GTBank" },
  { code: "FBNINGLA", name: "First Bank of Nigeria" },
  { code: "ABNGNGLA", name: "Access Bank" },
  { code: "ZAIBNGLA", name: "Zenith Bank" },
  { code: "UNAFNGLA", name: "United Bank for Africa" },
  { code: "STBINGLA", name: "Stanbic IBTC" },
] as const;

export interface BankAccount {
  accountNumber: string;
  bankCode: string;
  accountName: string;
}

interface BankAccountFormProps {
  value: BankAccount;
  onChange: (v: BankAccount) => void;
  disabled?: boolean;
}

const NUBAN_LENGTH = 10;

export default function BankAccountForm({
  value,
  onChange,
  disabled,
}: BankAccountFormProps) {
  const [error, setError] = useState<string | null>(null);

  const validateNuban = (s: string): boolean => {
    const digits = s.replace(/\D/g, "");
    return digits.length === NUBAN_LENGTH;
  };

  const handleAccountNumberChange = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, NUBAN_LENGTH);
    onChange({ ...value, accountNumber: digits });
    setError(
      digits.length > 0 && digits.length !== NUBAN_LENGTH
        ? "Account number must be 10 digits"
        : null
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-200">Bank</label>
        <Select
          value={value.bankCode}
          onChange={(e) => onChange({ ...value, bankCode: e.target.value })}
          disabled={disabled}
        >
          {NIGERIAN_BANKS.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-200">
          Account number (NUBAN)
        </label>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="0123456789"
          value={value.accountNumber}
          onChange={(e) => handleAccountNumberChange(e.target.value)}
          disabled={disabled}
          maxLength={NUBAN_LENGTH}
          error={error ?? undefined}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-200">Account name</label>
        <Input
          type="text"
          placeholder="As shown on your bank account"
          value={value.accountName}
          onChange={(e) => onChange({ ...value, accountName: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export function isBankAccountValid(account: BankAccount): boolean {
  return (
    account.accountNumber.replace(/\D/g, "").length === NUBAN_LENGTH &&
    account.bankCode.length > 0 &&
    account.accountName.trim().length > 0
  );
}
