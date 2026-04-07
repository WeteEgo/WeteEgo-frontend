"use client";

import type { TxLifecycleState } from "@/lib/flow-types";
import { mapContractError } from "@/lib/error-messages";
import { Button } from "@/components/ui/button";

interface TxLifecycleProps {
  state: TxLifecycleState;
  /** Label for the action button in idle state */
  actionLabel: string;
  /** Called when user clicks the action button */
  onAction: () => void;
  /** Called when user clicks retry after error */
  onRetry: () => void;
  /** Transaction hash for block explorer link */
  txHash?: `0x${string}`;
  /** Block explorer base URL */
  explorerUrl: string;
  /** Error object from wagmi */
  error?: Error | null;
  /** Disable the action button */
  disabled?: boolean;
  /** Extra description shown above the button in idle state */
  description?: string;
}

export function TxLifecycle({
  state,
  actionLabel,
  onAction,
  onRetry,
  txHash,
  explorerUrl,
  error,
  disabled,
  description,
}: TxLifecycleProps) {
  if (state === "idle") {
    return (
      <div className="space-y-3">
        {description && (
          <p className="text-xs text-[var(--text-muted)]">{description}</p>
        )}
        <Button className="w-full" onClick={onAction} disabled={disabled}>
          {actionLabel}
        </Button>
      </div>
    );
  }

  if (state === "prompting") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="h-12 w-12 rounded-full border-2 border-blue-400/40 bg-blue-500/10 flex items-center justify-center animate-pulse">
          <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-100">Confirm in your wallet</p>
        <p className="text-xs text-[var(--text-muted)]">
          A transaction request has been sent to your wallet.
        </p>
      </div>
    );
  }

  if (state === "confirming") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="h-12 w-12 rounded-full border-2 border-blue-400/40 bg-blue-500/10 flex items-center justify-center">
          <svg className="h-6 w-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-100">Transaction submitted</p>
        <p className="text-xs text-[var(--text-muted)]">Waiting for on-chain confirmation...</p>
        {txHash && (
          <a
            href={`${explorerUrl}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 underline"
          >
            View on explorer
          </a>
        )}
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="h-12 w-12 rounded-full border-2 border-emerald-400/40 bg-emerald-500/10 flex items-center justify-center">
          <svg className="h-6 w-6 text-emerald-400 animate-[drawCheck_0.4s_ease-out_forwards]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-sm font-medium text-emerald-300">Confirmed</p>
        {txHash && (
          <a
            href={`${explorerUrl}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 underline"
          >
            View on explorer
          </a>
        )}
      </div>
    );
  }

  // error state
  const mapped = mapContractError(error ?? null);
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="h-12 w-12 rounded-full border-2 border-red-400/40 bg-red-500/10 flex items-center justify-center">
        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <p className="text-sm font-medium text-red-300">{mapped.message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
