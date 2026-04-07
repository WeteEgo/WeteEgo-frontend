"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "./GlassCard";
import { Code2, Terminal } from "lucide-react";

const SNIPPET = `import { WeteEgoClient } from "@weteego/sdk";

const client = new WeteEgoClient({
  apiUrl: "https://api.weteego.example",
});

const order = await client.createOrder({
  wallet: userAddress,
  amountUsdc: 100n * 10n ** 6n,
  corridor: "NGN",
  bankAccount: verifiedNuban,
});

console.log(order.settlementRef);`;

export function DeveloperSection() {
  return (
    <section
      id="developers"
      className="border-t border-[var(--border-subtle)]/80 bg-black/20 px-4 py-[var(--section-y)] md:px-8 lg:px-10"
      aria-labelledby="dev-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]">
            <Terminal className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2
              id="dev-heading"
              className="font-display text-3xl tracking-tight text-white md:text-4xl lg:text-[clamp(2rem,4vw+0.5rem,2.75rem)]"
            >
              Build on the same primitives
            </h2>
            <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
              Typed SDK flows for quotes, orders, and settlement observation—designed for integrators who need protocol
              semantics, not opaque redirects.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-start">
          <GlassCard size="lg" className="font-mono text-[13px] leading-relaxed">
            <div className="mb-4 flex items-center gap-2 border-b border-white/[0.08] pb-3 text-xs text-[var(--text-muted)]">
              <Code2 className="h-4 w-4" aria-hidden />
              <span>@weteego/sdk · TypeScript</span>
            </div>
            <pre className="overflow-x-auto text-[var(--text-main)]">
              <code>{SNIPPET}</code>
            </pre>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard>
              <h3 className="font-display text-lg text-white">Operator roadmap</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Today WeteEgo operates as a Paycrest Sender. The docs repo tracks gateway semantics, webhook shapes, and
                how settlement refs map across PSP callbacks.
              </p>
              <motion.div className="mt-6" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/convert"
                  className="focus-ring inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent-gold)] px-5 py-3 text-sm font-semibold text-[#1a1200] shadow-landing-glow hover:brightness-110 md:w-auto"
                >
                  Become an operator (start in app)
                </Link>
              </motion.div>
            </GlassCard>
            <p className="text-xs text-[var(--text-muted)]">
              Snippet is illustrative—align parameters with the published SDK version before production use.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
