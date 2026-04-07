"use client";

import { useState, useEffect, useRef } from "react";
import type { OrderStatus } from "@/lib/flow-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const TERMINAL_STATUSES = new Set(["SETTLED", "FAILED", "REFUNDED"]);
const POLL_INTERVAL_MS = 2_000; // fallback polling — reduced from 5s

export interface TimelineEntry {
  label: string;
  detail?: string;
  status: "done" | "active" | "pending";
  txHash?: string;
}

function buildTimeline(orderStatus: OrderStatus | null, bankName?: string): TimelineEntry[] {
  const s = orderStatus?.status;

  return [
    {
      label: "Order created",
      status: s ? "done" : "pending",
    },
    {
      label: "USDC escrowed",
      status:
        s === "ESCROWED" || s === "SETTLED" || s === "FAILED" || s === "EXPIRED" || s === "REFUNDED"
          ? "done"
          : s === "PENDING" || s === "FORWARDED"
            ? "active"
            : "pending",
      txHash: orderStatus?.txHash,
    },
    {
      label: "Processing NGN payout",
      status: s === "SETTLED" ? "done" : s === "ESCROWED" ? "active" : "pending",
    },
    {
      label: bankName ? `NGN sent to ${bankName}` : "NGN sent to your bank",
      detail:
        s === "SETTLED"
          ? "Funds delivered"
          : s === "FAILED"
            ? "Settlement failed — funds will be refunded"
            : s === "EXPIRED"
              ? "Order expired — funds refundable on-chain"
              : s === "REFUNDED"
                ? "USDC refunded to your wallet"
                : "Estimated: 30 seconds – 2 minutes",
      status: s === "SETTLED" || s === "REFUNDED" ? "done" : "pending",
    },
  ];
}

interface UseSettlementPollingOptions {
  settlementRef: `0x${string}` | null;
  enabled: boolean;
  bankName?: string;
}

interface UseSettlementPollingReturn {
  orderStatus: OrderStatus | null;
  timeline: TimelineEntry[];
  isTerminal: boolean;
}

async function fetchOrderStatus(ref: string): Promise<OrderStatus | null> {
  try {
    const res = await fetch(`${API_URL}/api/orders/${ref}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data as OrderStatus) : null;
  } catch {
    return null;
  }
}

export function useSettlementPolling({
  settlementRef,
  enabled,
  bankName,
}: UseSettlementPollingOptions): UseSettlementPollingReturn {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !settlementRef || !API_URL) return;

    stoppedRef.current = false;

    const handleStatusUpdate = (status: OrderStatus) => {
      setOrderStatus(status);
    };

    let eventSource: EventSource | null = null;
    let pollingInterval: ReturnType<typeof setInterval> | null = null;

    const startPollingFallback = () => {
      if (stoppedRef.current) return;
      pollingInterval = setInterval(async () => {
        if (stoppedRef.current) {
          if (pollingInterval) clearInterval(pollingInterval);
          return;
        }
        const status = await fetchOrderStatus(settlementRef);
        if (status) {
          handleStatusUpdate(status);
          if (TERMINAL_STATUSES.has(status.status)) {
            if (pollingInterval) clearInterval(pollingInterval);
          }
        }
      }, POLL_INTERVAL_MS);
    };

    // Immediate fetch to populate initial state fast
    fetchOrderStatus(settlementRef).then((s) => {
      if (s && !stoppedRef.current) handleStatusUpdate(s);
    });

    // Try SSE first for near-instant updates
    if (typeof EventSource !== "undefined") {
      try {
        eventSource = new EventSource(`${API_URL}/api/orders/${settlementRef}/stream`);

        eventSource.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data) as { status?: string };
            if (!parsed.status) return; // heartbeat ping
            // Re-fetch full order to get txHash etc.
            fetchOrderStatus(settlementRef).then((s) => {
              if (s && !stoppedRef.current) handleStatusUpdate(s);
            });
            if (TERMINAL_STATUSES.has(parsed.status)) {
              eventSource?.close();
            }
          } catch {
            // ignore malformed messages
          }
        };

        eventSource.onerror = () => {
          eventSource?.close();
          eventSource = null;
          if (!stoppedRef.current) startPollingFallback();
        };
      } catch {
        startPollingFallback();
      }
    } else {
      startPollingFallback();
    }

    return () => {
      stoppedRef.current = true;
      eventSource?.close();
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [enabled, settlementRef]);

  const isTerminal = orderStatus ? TERMINAL_STATUSES.has(orderStatus.status) : false;
  const timeline = buildTimeline(orderStatus, bankName);

  return { orderStatus, timeline, isTerminal };
}
