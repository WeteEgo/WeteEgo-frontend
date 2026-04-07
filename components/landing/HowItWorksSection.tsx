"use client";

import { GlassCard } from "./GlassCard";
import { Reveal } from "./Reveal";
import { Banknote, ShieldCheck, Wallet } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Connect & quote",
    body: "Link your wallet on Base, pull a live USDC→fiat quote, and stay within tier limits before you touch the chain.",
    Icon: Wallet,
  },
  {
    n: "02",
    title: "Verify & escrow",
    body: "NUBAN check and account-name match, then approve USDC and lock funds in WeteEgo Gateway—bytes32 refs thread the full lifecycle.",
    Icon: ShieldCheck,
  },
  {
    n: "03",
    title: "Receive fiat",
    body: "We route payout through the Paycrest stack while you track status in-app—from escrowed to settled or refunded on timeout.",
    Icon: Banknote,
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-t border-[var(--border-subtle)]/80 px-4 py-[var(--section-y)] md:px-8 lg:px-10"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2
            id="how-heading"
            className="font-display text-3xl tracking-tight text-white md:text-4xl lg:text-[clamp(2rem,4vw+0.5rem,2.75rem)]"
          >
            How it works
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
            Three beats users feel—under the hood the product still runs the full seven-step journey with AML, polling,
            and reconciliation.
          </p>
        </Reveal>

        <div className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-6" role="list">
          <div
            className="pointer-events-none absolute left-[8%] right-[8%] top-10 hidden h-px md:block"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,212,255,0.35), rgba(255,184,0,0.35), transparent)",
            }}
            aria-hidden
          />
          {steps.map(({ n, title, body, Icon }, i) => (
            <Reveal key={n} delay={i * 0.06} y={24}>
              <div className="relative pt-6 md:pt-10" role="listitem">
                <span className="absolute left-1 top-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--bg-deep)] bg-gradient-to-br from-[var(--accent-cyan)] to-cyan-800 text-xs font-bold text-[#041018] shadow-lg md:left-1/2 md:-translate-x-1/2">
                  {n}
                </span>
                <GlassCard className="h-full pt-4 md:pt-2">
                  <Icon className="h-6 w-6 text-[var(--accent-cyan)]" aria-hidden />
                  <h3 className="font-display mt-4 text-lg text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{body}</p>
                </GlassCard>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12" y={20}>
          <div className="landing-gradient-border rounded-[var(--radius-feature)] p-px">
            <div className="rounded-[calc(var(--radius-feature)-1px)] bg-[var(--bg-mid)]/90 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
                Full journey (product)
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Connect → amount → bank details → review → approve USDC → create on-chain order → live tracking. AML and
                tier limits run before you ever call the gateway.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
