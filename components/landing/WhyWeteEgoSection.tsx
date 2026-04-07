"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlassCard } from "./GlassCard";
import { Clock, Percent, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function StatCounter({
  target,
  suffix,
  prefix = "",
  decimals = 0,
}: {
  target: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const o = { v: 0 };
      gsap.to(o, {
        v: target,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 82%",
          toggleActions: "play none none none",
        },
        onUpdate: () => {
          const n = decimals > 0 ? o.v.toFixed(decimals) : Math.round(o.v).toLocaleString();
          el.textContent = `${prefix}${n}${suffix}`;
        },
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef}>
      <span ref={ref} className="font-display text-4xl tabular-nums text-[var(--accent-cyan)] md:text-5xl">
        {prefix}
        {decimals > 0 ? (0).toFixed(decimals) : "0"}
        {suffix}
      </span>
    </div>
  );
}

const pillars = [
  {
    title: "Sub-2 min settlement",
    body: "Designed for fast correlation from on-chain escrow to fiat acknowledgement—latency you can feel in the product.",
    icon: Clock,
  },
  {
    title: "0.5% flat fee",
    body: "Simple economics: predictable take on volume, not hidden spreads buried in the quote.",
    icon: Percent,
  },
  {
    title: "Base-native",
    body: "USDC on Base first—where retail liquidity and infra maturity line up for the NGN corridor.",
    icon: Zap,
  },
] as const;

export function WhyWeteEgoSection() {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gridRef.current?.querySelectorAll(".why-card");
      if (!cards?.length) return;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 56, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: gridRef }
  );

  return (
    <section
      id="why"
      className="border-t border-[var(--border-subtle)]/80 px-4 py-[var(--section-y)] md:px-8 lg:px-10"
      aria-labelledby="why-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="why-heading"
          className="font-display text-3xl tracking-tight text-white md:text-4xl lg:text-[clamp(2rem,4vw+0.5rem,2.75rem)]"
        >
          Why WeteEgo
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
          Infrastructure cues: speed, transparent fees, and a chain choice aligned with real usage.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3" ref={gridRef}>
          {pillars.map(({ title, body, icon: Icon }) => (
            <GlassCard key={title} className="why-card flex flex-col">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-lg text-white">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">{body}</p>
            </GlassCard>
          ))}
        </div>

        <div className="mt-12 grid gap-6 rounded-[var(--radius-feature)] border border-[var(--border-glass)] bg-black/20 p-6 md:grid-cols-3 md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Target SLA
            </p>
            <div className="mt-2">
              <StatCounter target={120} suffix="s" />
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Correlated settlement window (demo target)</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Fee</p>
            <div className="mt-2">
              <StatCounter target={0.5} suffix="%" decimals={1} />
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Flat on routed volume</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Chain</p>
            <div className="mt-2">
              <span className="font-display text-4xl text-[var(--accent-gold)] md:text-5xl">8453</span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Base (mainnet roadmap alignment)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
