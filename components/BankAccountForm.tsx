"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  isBankAccountValid as isBankAccountComplete,
  type BankAccountFields,
} from "@/lib/bankAccountValidation";

export const NIGERIAN_BANKS = [
  { code: "GTBINGLA", name: "GTBank" },
  { code: "FBNINGLA", name: "First Bank of Nigeria" },
  { code: "ABNGNGLA", name: "Access Bank" },
  { code: "ZAIBNGLA", name: "Zenith Bank" },
  { code: "UNAFNGLA", name: "United Bank for Africa" },
  { code: "STBINGLA", name: "Stanbic IBTC" },
] as const;

export interface BankAccount extends BankAccountFields {}

interface BankAccountFormProps {
  value: BankAccount;
  onChange: (v: BankAccount) => void;
  disabled?: boolean;
  apiUrl?: string;
}

const NUBAN_LENGTH = 10;

function normalizeApiUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

async function fetchResolvedAccountName(
  apiUrl: string,
  bankCode: string,
  accountNumber: string
): Promise<{ accountName: string | null; bankName: string | null } | { error: string }> {
  const base = normalizeApiUrl(apiUrl);
  if (!base) return { error: "Backend URL not set" };
  try {
    const params = new URLSearchParams({ bankCode, accountNumber });
    const res = await fetch(`${base}/api/bank/verify-account?${params}`, {
      method: "GET",
      signal: AbortSignal.timeout(10_000),
    });
    const text = await res.text();
    let json: {
      success?: boolean;
      data?: { accountName?: string | null; bankName?: string | null };
      error?: string;
    };
    try {
      json = JSON.parse(text);
    } catch {
      return { error: res.ok ? "Invalid response" : `Server error (${res.status})` };
    }
    if (!res.ok || !json.success) {
      return { error: json.error ?? "Could not verify account" };
    }
    const name = json.data?.accountName ?? null;
    const bank = json.data?.bankName ?? null;
    return { accountName: name || null, bankName: bank || null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

export default function BankAccountForm({
  value,
  onChange,
  disabled,
  apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "",
}: BankAccountFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const lastFetchedRef = useRef<string>("");

  const digits = value.accountNumber.replace(/\D/g, "");
  const hasApiUrl = normalizeApiUrl(apiUrl ?? "").length > 0;
  const canResolve = digits.length === NUBAN_LENGTH && value.bankCode.length > 0;
  const resolveKey = `${value.bankCode}:${digits}`;

  useEffect(() => {
    if (!canResolve || lastFetchedRef.current === resolveKey) return;
    lastFetchedRef.current = resolveKey;
    setResolving(true);
    setResolveError(null);
    setResolvedName(null);
    fetchResolvedAccountName(apiUrl ?? "", value.bankCode, digits).then((result) => {
      setResolving(false);
      if ("error" in result) {
        setResolveError(result.error);
      } else if (result.accountName) {
        setResolvedName(result.accountName);
      }
    });
  }, [canResolve, resolveKey, apiUrl, value.bankCode, digits]);

  useEffect(() => {
    if (!canResolve) {
      lastFetchedRef.current = "";
      setResolvedName(null);
      setResolveError(null);
    }
  }, [canResolve]);

  const validateNuban = (s: string): boolean => {
    const d = s.replace(/\D/g, "");
    return d.length === NUBAN_LENGTH;
  };

  const handleAccountNumberChange = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, NUBAN_LENGTH);
    onChange({ ...value, accountNumber: d });
    setError(
      d.length > 0 && d.length !== NUBAN_LENGTH
        ? "Account number must be 10 digits"
        : null
    );
  };

  const handleUseResolvedName = () => {
    if (resolvedName) {
      onChange({ ...value, accountName: resolvedName });
    }
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
      {canResolve && (
        <div className="rounded-md border border-slate-600/60 bg-slate-800/40 p-3">
          {resolving && (
            <p className="text-xs text-[var(--text-muted)]">Checking account name…</p>
          )}
          {!resolving && !hasApiUrl && (
            <p className="text-xs text-[var(--text-muted)]">
              Set <code className="rounded bg-slate-700 px-1">NEXT_PUBLIC_API_URL</code> in .env to verify account name from your bank.
            </p>
          )}
          {!resolving && hasApiUrl && resolveError && (
            <p className="text-xs text-danger">{resolveError}</p>
          )}
          {!resolving && hasApiUrl && resolvedName && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Verified account name:</span>
              <span className="font-medium text-slate-100">{resolvedName}</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleUseResolvedName}
                disabled={disabled}
                className="shrink-0"
              >
                Use this name
              </Button>
            </div>
          )}
          {!resolving && hasApiUrl && !resolveError && !resolvedName && (
            <p className="text-xs text-[var(--text-muted)]">
              Account name could not be looked up — enter it manually below.
            </p>
          )}
        </div>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-200">Account name</label>
        <Input
          type="text"
          placeholder={
            resolvedName
              ? "Click “Use this name” above or type manually"
              : "As shown on your bank account"
          }
          value={value.accountName}
          onChange={(e) => onChange({ ...value, accountName: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export function isBankAccountValid(account: BankAccount): boolean {
  return isBankAccountComplete(account);
}
