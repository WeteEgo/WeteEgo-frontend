"use client";

import { useEffect } from "react";
import { TxLifecycle } from "@/components/convert/shared/TxLifecycle";
import { QuoteBar } from "@/components/convert/shared/QuoteBar";
import type { QuoteResult } from "@/lib/rates";
import type { TxLifecycleState } from "@/lib/flow-types";
import { Button } from "@/components/ui/button";

interface ApproveStepProps {
  amount: string;
  quote: QuoteResult | null;
  secondsLeft: number | null;
  isRefetching: boolean;
  onRefetch: () => void;
  explorerUrl: string;
  lifecycleState: TxLifecycleState;
  txHash: `0x${string}` | undefined;
  error: Error | null;
  onApprove: () => void;
  onRetry: () => void;
  onDone: () => void;
  onBack: () => void;
}

export function ApproveStep({
  amount,
  quote,
  secondsLeft,
  isRefetching,
  onRefetch,
  explorerUrl,
  lifecycleState,
  txHash,
  error,
  onApprove,
  onRetry,
  onDone,
  onBack,
}: ApproveStepProps) {
  // Auto-advance when approval succeeds
  useEffect(() => {
    if (lifecycleState === "success") {
      const timer = setTimeout(onDone, 1500);
      return () => clearTimeout(timer);
    }
  }, [lifecycleState, onDone]);

  return (
    <div className="space-y-4 animate-[fadeUp_0.2s_ease-out]">
      <div>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">
          Step 1 of 2
        </p>
        <h3 className="text-sm font-medium text-slate-200 mt-1">Approve USDC</h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Allow WeteEgo to use {amount} USDC for this conversion.
        </p>
      </div>

      <QuoteBar
        quote={quote}
        secondsLeft={secondsLeft}
        isRefetching={isRefetching}
        onRefetch={onRefetch}
      />

      <TxLifecycle
        state={lifecycleState}
        actionLabel="Approve USDC"
        onAction={onApprove}
        onRetry={onRetry}
        txHash={txHash}
        explorerUrl={explorerUrl}
        error={error}
        description="This gives the WeteEgo contract permission to transfer your USDC into escrow."
      />

      {lifecycleState === "idle" && (
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
      )}
    </div>
  );
}
