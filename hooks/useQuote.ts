"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchQuote, type QuoteResult } from "@/lib/rates";

interface UseQuoteOptions {
  amount: string;
  fiatCurrency: string;
  /** Only start countdown when true (e.g. on review/approve/convert steps) */
  countdownActive: boolean;
}

interface UseQuoteReturn {
  quote: QuoteResult | null;
  secondsLeft: number | null;
  isRefetching: boolean;
  expired: boolean;
  refetch: () => Promise<void>;
}

export function useQuote({ amount, fiatCurrency, countdownActive }: UseQuoteOptions): UseQuoteReturn {
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const usdcNum = Number(amount);
  const validAmount = amount && !isNaN(usdcNum) && usdcNum > 0;

  // Fetch quote when amount/currency changes
  useEffect(() => {
    if (!validAmount) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    fetchQuote(usdcNum, fiatCurrency).then((q) => {
      if (!cancelled) setQuote(q);
    });
    return () => { cancelled = true; };
  }, [amount, fiatCurrency, validAmount, usdcNum]);

  // 60-second countdown
  useEffect(() => {
    if (!countdownActive) {
      setSecondsLeft(null);
      return;
    }
    setSecondsLeft(60);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownActive]);

  // Auto-refresh every 30s when countdown active
  const refetch = useCallback(async () => {
    if (!validAmount) return;
    setIsRefetching(true);
    try {
      const q = await fetchQuote(usdcNum, fiatCurrency);
      setQuote(q);
      setSecondsLeft(60);
    } finally {
      setIsRefetching(false);
    }
  }, [amount, fiatCurrency, validAmount, usdcNum]);

  useEffect(() => {
    if (!countdownActive || !validAmount) return;
    const interval = setInterval(refetch, 30_000);
    return () => clearInterval(interval);
  }, [countdownActive, refetch, validAmount]);

  return {
    quote,
    secondsLeft,
    isRefetching,
    expired: secondsLeft === 0,
    refetch,
  };
}
