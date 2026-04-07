"use client";

import { useCallback, useEffect, useState } from "react";
import { NIGERIAN_BANKS } from "@/components/BankAccountForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const ENV_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "";

type Tab = "orders" | "aml";

interface OrderRow {
  id: string;
  settlementRef: string;
  status: string;
  walletAddress: string;
  fiatAmount: number;
  fiatCurrency: string;
  createdAt: string;
  updatedAt?: string;
  bankAccount?: string | null;
  provider?: string | null;
  pspProvider?: string | null;
  pspReference?: string | null;
  txHash?: string | null;
  riskScore?: number;
}

interface AMLAlertRow {
  id: string;
  walletAddress: string;
  ruleTriggered: string;
  severity: string;
  status: string;
  notes?: string | null;
  createdAt: string;
}

interface AuditLogRow {
  id: string;
  action: string;
  actor?: string | null;
  previousState?: string | null;
  newState?: string | null;
  createdAt: string;
  metadata?: unknown;
}

function bankLabelFromOrder(order: Pick<OrderRow, "bankAccount">): string {
  if (!order.bankAccount) return "—";
  try {
    const b = JSON.parse(order.bankAccount) as {
      bankCode?: string;
      accountNumber?: string;
    };
    const name = NIGERIAN_BANKS.find((x) => x.code === b.bankCode)?.name;
    return name ?? b.bankCode ?? "—";
  } catch {
    return "—";
  }
}

function statusBadgeClass(status: string): string {
  const base =
    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide";
  switch (status) {
    case "SETTLED":
      return `${base} bg-emerald-500/20 text-emerald-300`;
    case "ESCROWED":
    case "PAYOUT_SENT":
      return `${base} bg-sky-500/20 text-sky-300`;
    case "FAILED":
    case "EXPIRED":
      return `${base} bg-red-500/20 text-red-300`;
    case "REFUNDED":
      return `${base} bg-amber-500/20 text-amber-200`;
    default:
      return `${base} bg-slate-600/40 text-slate-300`;
  }
}

function severityBadgeClass(sev: string): string {
  const base = "inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium";
  if (sev === "high") return `${base} bg-red-500/25 text-red-200`;
  if (sev === "medium") return `${base} bg-amber-500/25 text-amber-200`;
  return `${base} bg-slate-600/50 text-slate-300`;
}

export default function AdminPage() {
  const [key, setKey] = useState(ENV_ADMIN_KEY);
  const [submitted, setSubmitted] = useState(!!ENV_ADMIN_KEY);
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [alerts, setAlerts] = useState<AMLAlertRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailRef, setDetailRef] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<OrderRow | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refundMsg, setRefundMsg] = useState<string | null>(null);
  const [refundBusy, setRefundBusy] = useState(false);

  const authHeaders = useCallback(
    (): HeadersInit => ({
      "x-admin-key": key,
      "Content-Type": "application/json",
    }),
    [key]
  );

  const loadOrders = useCallback(async () => {
    if (!submitted || !key || !API_URL) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/admin/orders?limit=100`, {
        headers: { "x-admin-key": key },
      });
      if (r.status === 401) throw new Error("Invalid admin key");
      const json = (await r.json()) as { data?: OrderRow[] };
      setOrders(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [submitted, key]);

  const loadAlerts = useCallback(async () => {
    if (!submitted || !key || !API_URL) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_URL}/admin/aml/alerts?limit=100`, {
        headers: { "x-admin-key": key },
      });
      if (r.status === 401) throw new Error("Invalid admin key");
      const json = (await r.json()) as { data?: AMLAlertRow[] };
      setAlerts(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [submitted, key]);

  useEffect(() => {
    if (!submitted || !key || !API_URL) return;
    if (tab === "orders") void loadOrders();
    else void loadAlerts();
  }, [submitted, key, tab, loadOrders, loadAlerts]);

  const openDetail = async (ref: string) => {
    if (!API_URL || !key) return;
    setDetailRef(ref);
    setDetailOrder(null);
    setAuditLogs([]);
    setRefundMsg(null);
    setDetailLoading(true);
    try {
      const or = await fetch(`${API_URL}/admin/orders/${encodeURIComponent(ref)}`, {
        headers: { "x-admin-key": key },
      });
      if (!or.ok) throw new Error("Order detail failed");
      const oj = (await or.json()) as { data?: OrderRow };
      const order = oj.data ?? null;
      setDetailOrder(order);
      if (order?.id) {
        const auditRes = await fetch(
          `${API_URL}/admin/audit-log?entityType=Order&entityId=${encodeURIComponent(order.id)}&limit=100`,
          { headers: { "x-admin-key": key } }
        );
        if (auditRes.ok) {
          const aj = (await auditRes.json()) as { data?: AuditLogRow[] };
          setAuditLogs(aj.data ?? []);
        }
      }
    } catch {
      setDetailOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailRef(null);
    setDetailOrder(null);
    setAuditLogs([]);
    setRefundMsg(null);
  };

  useEffect(() => {
    if (!detailRef) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailRef]);

  const requestRefund = async () => {
    if (!detailRef || !API_URL || !key) return;
    setRefundBusy(true);
    setRefundMsg(null);
    try {
      const r = await fetch(
        `${API_URL}/admin/orders/${encodeURIComponent(detailRef)}/refund`,
        { method: "POST", headers: authHeaders() }
      );
      const j = (await r.json()) as { message?: string; error?: string };
      setRefundMsg(j.message ?? j.error ?? (r.ok ? "OK" : "Failed"));
    } catch {
      setRefundMsg("Network error");
    } finally {
      setRefundBusy(false);
    }
  };

  const patchAlert = async (id: string, status: string) => {
    if (!API_URL || !key) return;
    try {
      const r = await fetch(`${API_URL}/admin/aml/alerts/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status, notes: `Updated via admin (${status})` }),
      });
      if (r.ok) void loadAlerts();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen text-[var(--text-main)]">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
        WeteEgo Admin
      </h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Operations dashboard — orders lifecycle and AML alerts.
      </p>

      {!submitted ? (
        <div className="mt-8 max-w-md space-y-4 rounded-[var(--radius-feature)] border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 p-6 shadow-[var(--shadow-elev-1)]">
          <label className="block text-xs font-medium text-[var(--text-muted)]">
            Admin key
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste ADMIN_KEY (sent as x-admin-key)"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-slate-100 outline-none ring-[var(--accent-ring)] focus:ring-2"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-slate-950 hover:bg-[var(--accent-strong)]"
          >
            Continue
          </button>
          {!API_URL && (
            <p className="text-xs text-amber-400">
              Set <code className="rounded bg-slate-800 px-1">NEXT_PUBLIC_API_URL</code>{" "}
              to your backend origin.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-xs text-[var(--text-muted)] underline underline-offset-2 hover:text-slate-200"
            >
              Change key
            </button>
            <nav className="flex gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]/60 p-1">
              {(
                [
                  ["orders", "Orders"],
                  ["aml", "AML alerts"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                    tab === id
                      ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          {loading && <p className="mt-4 text-sm text-[var(--text-muted)]">Loading…</p>}

          {!loading && !error && tab === "orders" && (
            <div className="mt-6 overflow-x-auto rounded-[var(--radius-feature)] border border-[var(--border-subtle)] bg-[var(--bg-card)]/60 shadow-[var(--shadow-elev-1)]">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="px-3 py-2">Settlement ref</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Fiat</th>
                    <th className="px-3 py-2">Wallet</th>
                    <th className="px-3 py-2">Bank</th>
                    <th className="px-3 py-2">Provider</th>
                    <th className="px-3 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      tabIndex={0}
                      className="cursor-pointer border-b border-[var(--border-subtle)]/60 hover:bg-[var(--bg-elevated)]/50 focus:bg-[var(--bg-elevated)]/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-ring)]"
                      onClick={() => void openDetail(o.settlementRef)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          void openDetail(o.settlementRef);
                        }
                      }}
                    >
                      <td className="max-w-[140px] truncate px-3 py-2 font-mono text-xs">
                        {o.settlementRef}
                      </td>
                      <td className="px-3 py-2">
                        <span className={statusBadgeClass(o.status)}>
                          {o.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {o.fiatAmount} {o.fiatCurrency}
                      </td>
                      <td className="max-w-[120px] truncate px-3 py-2 font-mono text-xs">
                        {o.walletAddress}
                      </td>
                      <td className="px-3 py-2 text-xs">{bankLabelFromOrder(o)}</td>
                      <td className="px-3 py-2 text-xs text-[var(--text-muted)]">
                        {o.pspProvider ?? o.provider ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-[var(--text-muted)]">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <p className="p-6 text-sm text-[var(--text-muted)]">No orders.</p>
              )}
            </div>
          )}

          {!loading && !error && tab === "aml" && (
            <div className="mt-6 overflow-x-auto rounded-[var(--radius-feature)] border border-[var(--border-subtle)] bg-[var(--bg-card)]/60 shadow-[var(--shadow-elev-1)]">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    <th className="px-3 py-2">Wallet</th>
                    <th className="px-3 py-2">Rule</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-[var(--border-subtle)]/60"
                    >
                      <td className="max-w-[140px] truncate px-3 py-2 font-mono text-xs">
                        {a.walletAddress}
                      </td>
                      <td className="px-3 py-2 text-xs">{a.ruleTriggered}</td>
                      <td className="px-3 py-2">
                        <span className={severityBadgeClass(a.severity)}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{a.status}</td>
                      <td className="space-x-2 px-3 py-2">
                        <button
                          type="button"
                          className="text-xs text-sky-400 hover:underline"
                          onClick={() => void patchAlert(a.id, "reviewed")}
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          className="text-xs text-[var(--text-muted)] hover:underline"
                          onClick={() => void patchAlert(a.id, "dismissed")}
                        >
                          Dismiss
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {alerts.length === 0 && (
                <p className="p-6 text-sm text-[var(--text-muted)]">No alerts.</p>
              )}
            </div>
          )}
        </>
      )}

      {detailRef && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeDetail}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-order-detail-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-feature)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-elev-2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <h2
                id="admin-order-detail-title"
                className="text-lg font-semibold text-slate-100"
              >
                Order detail
              </h2>
              <button
                type="button"
                className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-slate-200"
                aria-label="Close"
                onClick={closeDetail}
              >
                ✕
              </button>
            </div>

            {detailLoading && (
              <p className="mt-4 text-sm text-[var(--text-muted)]">Loading…</p>
            )}
            {!detailLoading && detailOrder && (
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-[var(--text-muted)]">Ref</dt>
                  <dd className="break-all font-mono text-xs">{detailOrder.settlementRef}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Status</dt>
                  <dd>
                    <span className={statusBadgeClass(detailOrder.status)}>
                      {detailOrder.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Wallet</dt>
                  <dd className="break-all font-mono text-xs">{detailOrder.walletAddress}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Bank</dt>
                  <dd className="text-xs">{bankLabelFromOrder(detailOrder)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">PSP</dt>
                  <dd className="text-xs">
                    {detailOrder.pspProvider ?? detailOrder.provider ?? "—"}{" "}
                    {detailOrder.pspReference
                      ? `· ${detailOrder.pspReference}`
                      : ""}
                  </dd>
                </div>
                {detailOrder.txHash && (
                  <div>
                    <dt className="text-[var(--text-muted)]">Tx</dt>
                    <dd className="break-all font-mono text-xs">{detailOrder.txHash}</dd>
                  </div>
                )}
              </dl>
            )}

            {!detailLoading && detailOrder && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Audit trail
                </h3>
                <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-xs">
                  {auditLogs.length === 0 && (
                    <li className="text-[var(--text-muted)]">No log rows.</li>
                  )}
                  {auditLogs.map((log) => (
                    <li
                      key={log.id}
                      className="rounded border border-[var(--border-subtle)]/80 bg-[var(--bg-elevated)]/40 px-2 py-1.5"
                    >
                      <span className="text-[var(--text-muted)]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>{" "}
                      <span className="font-medium text-slate-200">{log.action}</span>
                      {(log.previousState || log.newState) && (
                        <span className="text-[var(--text-muted)]">
                          {" "}
                          {log.previousState ?? "—"} → {log.newState ?? "—"}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!detailLoading && detailRef && (
              <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-4">
                <button
                  type="button"
                  disabled={refundBusy}
                  className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/20 disabled:opacity-50"
                  onClick={() => void requestRefund()}
                >
                  {refundBusy ? "Working…" : "Mark refunded (on-chain note)"}
                </button>
                {refundMsg && (
                  <p className="text-xs text-[var(--text-muted)]">{refundMsg}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
