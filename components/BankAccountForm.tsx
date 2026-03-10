"use client";

import { useState } from "react";

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
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bank
        </label>
        <select
          value={value.bankCode}
          onChange={(e) => onChange({ ...value, bankCode: e.target.value })}
          disabled={disabled}
          className="w-full border rounded px-3 py-2"
        >
          {NIGERIAN_BANKS.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account number (NUBAN)
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0123456789"
          value={value.accountNumber}
          onChange={(e) => handleAccountNumberChange(e.target.value)}
          disabled={disabled}
          className="w-full border rounded px-3 py-2"
          maxLength={NUBAN_LENGTH}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account name
        </label>
        <input
          type="text"
          placeholder="As shown on your bank account"
          value={value.accountName}
          onChange={(e) => onChange({ ...value, accountName: e.target.value })}
          disabled={disabled}
          className="w-full border rounded px-3 py-2"
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
