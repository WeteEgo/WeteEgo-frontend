"use client";

import { GlassCard } from "./GlassCard";
import { Reveal } from "./Reveal";
import { Building2, Hexagon, Lock, Shield } from "lucide-react";
import { RoadmapSection } from "./RoadmapSection";

const badges = [
  { label: "Built on Base", Icon: Building2 },
  { label: "Paycrest protocol", Icon: Hexagon },
  { label: "Non-custodial escrow", Icon: Lock },
  { label: "Audited contracts (roadmap)", Icon: Shield },
] as const;

export function TrustSection() {
  return (
    <section
      id="trust"
      className="border-t border-[var(--border-subtle)]/80 px-4 py-[var(--section-y)] md:px-8 lg:px-10"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2
            id="trust-heading"
            className="font-display text-3xl tracking-tight text-white md:text-4xl lg:text-[clamp(2rem,4vw+0.5rem,2.75rem)]"
          >
            Trust and security
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
            Money movement demands boring guarantees: clear custody boundaries, observable state, and room to harden
            over time.
          </p>
        </Reveal>

        <ul className="mt-8 flex flex-wrap gap-3">
          {badges.map(({ label, Icon }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-glass)] bg-white/[0.04] px-4 py-2 text-sm text-[var(--text-muted)] backdrop-blur-sm"
            >
              <Icon className="h-4 w-4 text-[var(--accent-cyan)]" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        <Reveal className="mt-10" y={24}>
          <GlassCard size="lg" className="relative overflow-hidden">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent-cyan)]/10 blur-3xl"
              aria-hidden
            />
            <div className="relative grid gap-6 md:grid-cols-[1fr,auto] md:items-center">
              <div>
                <h3 className="font-display text-xl text-white">Defense in depth</h3>
                <ul className="mt-4 grid gap-3 text-sm text-[var(--text-muted)] md:grid-cols-2">
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-green)]" aria-hidden>
                      ✓
                    </span>
                    AML rules before order creation; guest/basic/full tier limits.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-green)]" aria-hidden>
                      ✓
                    </span>
                    Rate limits, idempotency keys, and audited admin surfaces on the backend.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-green)]" aria-hidden>
                      ✓
                    </span>
                    On-chain escrow reduces opaque custodial float versus pure off-chain ledgers.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--accent-green)]" aria-hidden>
                      ✓
                    </span>
                    Metrics, logs, reconciliation workers—operations as a first-class product surface.
                  </li>
                </ul>
              </div>
              <div
                className="hidden h-28 w-28 shrink-0 rounded-2xl border border-[var(--accent-cyan)]/25 bg-[var(--accent-cyan)]/5 md:flex md:items-center md:justify-center"
                aria-hidden
              >
                <Shield className="h-14 w-14 text-[var(--accent-cyan)]/80" />
              </div>
            </div>
          </GlassCard>
        </Reveal>

        <div className="mt-[var(--section-y)] border-t border-[var(--border-subtle)]/60 pt-[var(--section-y)]">
          <RoadmapSection embedded />
        </div>
      </div>
    </section>
  );
}
