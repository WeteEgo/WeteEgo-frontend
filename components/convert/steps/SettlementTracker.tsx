"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import type { TimelineEntry } from "@/hooks/useSettlementPolling";
import type { OrderStatusValue } from "@/lib/flow-types";

interface SettlementTrackerProps {
  timeline: TimelineEntry[];
  status: OrderStatusValue | null;
  settlementRef: `0x${string}` | null;
  convertTxHash: `0x${string}` | null;
  explorerUrl: string;
  guestCheckout: boolean;
  onNewConversion: () => void;
}

function StatusBadge({ status }: { status: OrderStatusValue | null }) {
  if (!status) return null;

  const styles: Record<string, string> = {
    SETTLED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    FAILED: "bg-red-500/10 text-red-300 border-red-500/30",
    EXPIRED: "bg-red-500/10 text-red-300 border-red-500/30",
    REFUNDED: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    ESCROWED: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    FORWARDED: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  };

  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium ${styles[status] ?? styles.PENDING}`}>
      {status}
    </span>
  );
}

function TimelineDot({ status }: { status: TimelineEntry["status"] }) {
  if (status === "done") {
    return (
      <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
        <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="h-6 w-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
        <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
      </div>
    );
  }
  return (
    <div className="h-6 w-6 rounded-full bg-slate-800/60 border border-slate-700/40 shrink-0" />
  );
}

function ElapsedTimer({ active }: { active: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      startRef.current = null;
      return;
    }
    if (startRef.current === null) {
      startRef.current = Date.now();
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;
  return (
    <span className="text-[0.65rem] text-blue-300/70">{elapsed}s elapsed</span>
  );
}

export function SettlementTracker({
  timeline,
  status,
  settlementRef,
  convertTxHash,
  explorerUrl,
  guestCheckout,
  onNewConversion,
}: SettlementTrackerProps) {
  const [copied, setCopied] = useState(false);
  const isTerminal = status === "SETTLED" || status === "FAILED" || status === "REFUNDED";
  const isProcessing = status === "ESCROWED";

  const copyRef = () => {
    if (settlementRef) {
      navigator.clipboard.writeText(settlementRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5 animate-[fadeUp_0.2s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-200">Settlement status</h3>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Tracking your USDC to NGN conversion.
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {status === "SETTLED" && (
        <Alert variant="success">
          NGN has been sent to your bank account. The transfer should arrive shortly.
        </Alert>
      )}

      {status === "FAILED" && (
        <Alert variant="error">
          Settlement failed. Your USDC will be refunded to your wallet automatically.
        </Alert>
      )}

      {/* Timeline */}
      <div className="relative pl-3">
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-700/50" />

        <div className="space-y-0">
          {timeline.map((entry, i) => (
            <div key={i} className="flex gap-3 py-2.5 relative">
              <TimelineDot status={entry.status} />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-medium ${
                    entry.status === "done" ? "text-slate-200" : entry.status === "active" ? "text-blue-300" : "text-slate-500"
                  }`}>
                    {entry.label}
                  </p>
                  {/* Show elapsed timer on the "Processing NGN payout" step */}
                  {entry.status === "active" && entry.label.includes("Processing") && (
                    <ElapsedTimer active={isProcessing} />
                  )}
                </div>
                {entry.detail && (
                  <p className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">{entry.detail}</p>
                )}
                {entry.status === "active" && entry.label.includes("Processing") && !entry.detail && (
                  <p className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">
                    Paycrest is settling your order...
                  </p>
                )}
                {entry.txHash && (
                  <a
                    href={`${explorerUrl}/tx/${entry.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.65rem] text-blue-400 underline"
                  >
                    View on explorer
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="rounded-lg border border-[var(--border-subtle)]/40 bg-slate-900/30 px-3 py-2.5 space-y-1.5">
        {convertTxHash && (
          <div className="flex items-center justify-between text-[0.65rem]">
            <span className="text-[var(--text-muted)]">Transaction</span>
            <a
              href={`${explorerUrl}/tx/${convertTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline font-mono"
            >
              {convertTxHash.slice(0, 10)}...{convertTxHash.slice(-6)}
            </a>
          </div>
        )}
        {settlementRef && (
          <div className="flex items-center justify-between text-[0.65rem]">
            <span className="text-[var(--text-muted)]">Reference</span>
            <button
              onClick={copyRef}
              className="text-slate-300 font-mono hover:text-white transition-colors"
            >
              {copied ? "Copied" : `${settlementRef.slice(0, 10)}...${settlementRef.slice(-6)}`}
            </button>
          </div>
        )}
        {guestCheckout && (
          <div className="flex items-center justify-between text-[0.65rem]">
            <span className="text-[var(--text-muted)]">Mode</span>
            <span className="text-slate-400">Guest checkout</span>
          </div>
        )}
      </div>

      {isTerminal && (
        <Button variant="secondary" className="w-full" onClick={onNewConversion}>
          Start new conversion
        </Button>
      )}
    </div>
  );
}
