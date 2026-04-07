"use client";

import type { QuoteResult } from "@/lib/rates";
import { Button } from "@/components/ui/button";

interface QuoteBarProps {
  quote: QuoteResult | null;
  secondsLeft: number | null;
  isRefetching: boolean;
  onRefetch: () => void;
}

function CountdownCircle({ seconds, max }: { seconds: number; max: number }) {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / max;
  const offset = circumference * (1 - progress);
  const isUrgent = seconds <= 10;

  return (
    <div className="relative h-7 w-7 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-slate-700/50"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 linear ${isUrgent ? "text-red-400" : "text-blue-400"}`}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-[0.55rem] font-medium ${
          isUrgent ? "text-red-300" : "text-slate-300"
        }`}
      >
        {seconds}
      </span>
    </div>
  );
}

export function QuoteBar({ quote, secondsLeft, isRefetching, onRefetch }: QuoteBarProps) {
  if (!quote) return null;

  const rateText = `1 USDC = ${quote.rate.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${quote.fiatCurrency}`;
  const expired = secondsLeft === 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)]/60 bg-slate-900/50 px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        {secondsLeft !== null && !expired && (
          <CountdownCircle seconds={secondsLeft} max={60} />
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-200 truncate">{rateText}</p>
          {quote.source === "fallback" && (
            <p className="text-[0.6rem] text-amber-400">Estimated rate</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {expired && (
          <span className="text-[0.65rem] text-red-400 font-medium">Expired</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefetch}
          disabled={isRefetching}
          className="text-[0.65rem] px-2 py-1"
        >
          {isRefetching ? "..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
}
