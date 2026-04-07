"use client";

import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { Globe2 } from "lucide-react";

const LIVE = [
  { code: "NGN", label: "Nigeria", flag: "🇳🇬" },
  { code: "GHS", label: "Ghana", flag: "🇬🇭" },
  { code: "KES", label: "Kenya", flag: "🇰🇪" },
  { code: "ZAR", label: "South Africa", flag: "🇿🇦" },
] as const;

const SOON = [
  { code: "XAF", label: "Central Africa", flag: "🌍" },
  { code: "EGP", label: "Egypt", flag: "🇪🇬" },
] as const;

export function CorridorsSection() {
  return (
    <section
      id="corridors"
      className="border-t border-[var(--border-subtle)]/80 bg-black/15 px-4 py-[var(--section-y)] md:px-8 lg:px-10"
      aria-labelledby="corridors-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="corridors-heading"
              className="font-display text-3xl tracking-tight text-white md:text-4xl lg:text-[clamp(2rem,4vw+0.5rem,2.75rem)]"
            >
              Supported corridors
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
              Corridor depth expands in phases—starting with the markets where liquidity and compliance hooks are
              production-ready.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-glass)] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[var(--accent-gold)]">
            <Globe2 className="h-3.5 w-3.5" aria-hidden />
            More soon
          </span>
        </div>

        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Live & ramping</p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {LIVE.map((c, i) => (
              <motion.li
                key={c.code}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 380, damping: 26 }}
              >
                <GlassCard size="sm" className="flex min-w-[140px] items-center gap-3 !py-3 !px-4">
                  <span className="text-2xl" aria-hidden>
                    {c.flag}
                  </span>
                  <div>
                    <p className="font-display text-sm text-white">{c.code}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{c.label}</p>
                  </div>
                </GlassCard>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">On the roadmap</p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {SOON.map((c, i) => (
              <motion.li
                key={c.code}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 380, damping: 26 }}
              >
                <div className="flex min-w-[140px] items-center gap-3 rounded-xl border border-dashed border-[var(--border-glass)] bg-white/[0.02] px-4 py-3">
                  <span className="text-2xl opacity-80" aria-hidden>
                    {c.flag}
                  </span>
                  <div>
                    <p className="font-display text-sm text-[var(--text-muted)]">{c.code}</p>
                    <p className="text-[11px] text-[var(--text-muted)]/80">{c.label}</p>
                  </div>
                </div>
              </motion.li>
            ))}
            <motion.li
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center"
            >
              <span className="rounded-xl border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan)]/5 px-4 py-3 text-xs font-medium text-[var(--accent-cyan)]">
                + expand with your LP network
              </span>
            </motion.li>
          </ul>
        </div>
      </div>
    </section>
  );
}
