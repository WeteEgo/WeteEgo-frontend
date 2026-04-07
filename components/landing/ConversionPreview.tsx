"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "./GlassCard";
import { ArrowDown, CircleDollarSign } from "lucide-react";

const CORRIDORS = [
  { code: "NGN", name: "Nigerian Naira", flag: "NG", rate: 1620 },
  { code: "GHS", name: "Ghanaian Cedi", flag: "GH", rate: 15.2 },
  { code: "KES", name: "Kenyan Shilling", flag: "KE", rate: 129 },
  { code: "ZAR", name: "South African Rand", flag: "ZA", rate: 18.8 },
] as const;

export function ConversionPreview() {
  const [amount, setAmount] = useState("100");
  const [corridor, setCorridor] = useState<(typeof CORRIDORS)[number]>(CORRIDORS[0]);

  const fiatAmount = useMemo(() => {
    const n = parseFloat(amount || "0");
    if (Number.isNaN(n)) return "—";
    return Math.round(n * corridor.rate).toLocaleString();
  }, [amount, corridor.rate]);

  return (
    <GlassCard size="lg" className="w-full max-w-md shadow-landing-glow" hover>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Live preview
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-green)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-green)] opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-green)]" />
          </span>
          Demo rates
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-xs text-[var(--text-muted)]">You send</label>
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border-glass)] bg-black/25 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2775CA] text-white">
              <CircleDollarSign className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-white">USDC</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="ml-auto w-28 bg-transparent text-right text-xl font-bold tabular-nums text-white outline-none"
              aria-label="USDC amount"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-glass)] bg-white/[0.05] text-[var(--accent-cyan)]">
            <ArrowDown className="h-4 w-4" aria-hidden />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs text-[var(--text-muted)]">They receive</label>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--accent-cyan)]/25 bg-black/25 px-4 py-3">
            <select
              value={corridor.code}
              onChange={(e) => {
                const c = CORRIDORS.find((x) => x.code === e.target.value);
                if (c) setCorridor(c);
              }}
              className="max-w-[40%] cursor-pointer bg-transparent text-sm font-semibold text-white outline-none"
              aria-label="Fiat corridor"
            >
              {CORRIDORS.map((c) => (
                <option key={c.code} value={c.code} className="bg-[var(--bg-mid)] text-white">
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <div className="ml-auto text-right">
              <p className="text-xl font-bold tabular-nums text-[var(--accent-cyan)]">{fiatAmount}</p>
              <p className="text-[11px] text-[var(--text-muted)]">{corridor.name}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-white/[0.06] pt-4 text-xs text-[var(--text-muted)]">
          <span>
            1 USDC ≈ {corridor.rate.toLocaleString()} {corridor.code}
          </span>
          <span>Fee: 0.5% flat</span>
        </div>
      </div>
    </GlassCard>
  );
}
