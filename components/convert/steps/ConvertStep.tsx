"use client";

import { useEffect } from "react";
import { TxLifecycle } from "@/components/convert/shared/TxLifecycle";
import { ErrorBanner } from "@/components/convert/shared/ErrorBanner";
import { QuoteBar } from "@/components/convert/shared/QuoteBar";
import { mapBackendError } from "@/lib/error-messages";
import type { QuoteResult } from "@/lib/rates";
import type { TxLifecycleState } from "@/lib/flow-types";

interface ConvertStepProps {
  amount: string;
  quote: QuoteResult | null;
  secondsLeft: number | null;
  isRefetching: boolean;
  expired: boolean;
  onRefetch: () => void;
  explorerUrl: string;
  /** Whether approval was skipped (already had allowance) */
  skippedApproval: boolean;
  lifecycleState: TxLifecycleState;
  txHash: `0x${string}` | undefined;
  error: Error | null;
  backendError: string | null;
  isCreatingOrder: boolean;
  onSubmit: () => void;
  onRetry: () => void;
  onDone: () => void;
}

export function ConvertStep({
  amount,
  quote,
  secondsLeft,
  isRefetching,
  expired,
  onRefetch,
  explorerUrl,
  skippedApproval,
  lifecycleState,
  txHash,
  error,
  backendError,
  isCreatingOrder,
  onSubmit,
  onRetry,
  onDone,
}: ConvertStepProps) {
  // Auto-advance when convert tx succeeds
  useEffect(() => {
    if (lifecycleState === "success") {
      const timer = setTimeout(onDone, 1500);
      return () => clearTimeout(timer);
    }
  }, [lifecycleState, onDone]);

  const stepLabel = skippedApproval ? "" : "Step 2 of 2";

  return (
    <div className="space-y-4 animate-[fadeUp_0.2s_ease-out]">
      <div>
        {stepLabel && (
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">
            {stepLabel}
          </p>
        )}
        <h3 className="text-sm font-medium text-slate-200 mt-1">Convert USDC</h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Send {amount} USDC to the escrow contract to start your NGN payout.
        </p>
      </div>

      <QuoteBar
        quote={quote}
        secondsLeft={secondsLeft}
        isRefetching={isRefetching}
        onRefetch={onRefetch}
      />

      {backendError && (
        <ErrorBanner message={mapBackendError(backendError)} onRetry={onRetry} />
      )}

      {isCreatingOrder && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <svg className="h-4 w-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs text-[var(--text-muted)]">Preparing your order...</span>
        </div>
      )}

      {!isCreatingOrder && !backendError && (
        <TxLifecycle
          state={lifecycleState}
          actionLabel="Convert USDC"
          onAction={onSubmit}
          onRetry={onRetry}
          txHash={txHash}
          explorerUrl={explorerUrl}
          error={error}
          disabled={expired}
        />
      )}
    </div>
  );
}
