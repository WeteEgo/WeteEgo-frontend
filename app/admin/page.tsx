"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface OrderRow {
  id: string;
  settlementRef: string;
  status: string;
  walletAddress: string;
  fiatAmount: number;
  fiatCurrency: string;
  createdAt: string;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submitted || !key || !API_URL) return;
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/admin/orders?limit=50`, {
      headers: { "X-Admin-Key": key },
    })
      .then((r) => {
        if (r.status === 401) throw new Error("Invalid admin key");
        return r.json();
      })
      .then((json) => {
        if (json.data) setOrders(json.data);
        else setOrders([]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [submitted, key]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">WeteEgo Admin</h1>
      {!submitted ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin key
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter X-Admin-Key"
            className="border rounded px-3 py-2 w-64"
          />
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            View orders
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-sm text-gray-500 underline mb-4"
          >
            Change key
          </button>
          {error && (
            <p className="text-red-600 mb-2">{error}</p>
          )}
          {loading && <p>Loading…</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1 text-left">Ref</th>
                    <th className="border px-2 py-1 text-left">Status</th>
                    <th className="border px-2 py-1 text-left">Wallet</th>
                    <th className="border px-2 py-1 text-right">Fiat</th>
                    <th className="border px-2 py-1 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="border px-2 py-1 font-mono text-xs">
                        {o.settlementRef.slice(0, 18)}…
                      </td>
                      <td className="border px-2 py-1">{o.status}</td>
                      <td className="border px-2 py-1 font-mono text-xs">
                        {o.walletAddress.slice(0, 10)}…
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {o.fiatAmount} {o.fiatCurrency}
                      </td>
                      <td className="border px-2 py-1 text-sm">
                        {new Date(o.createdAt).toISOString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <p className="mt-2">No orders.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
