"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "./GlassCard";
import { Mail } from "lucide-react";

const WAITLIST_EMAIL = process.env.NEXT_PUBLIC_WAITLIST_EMAIL ?? "hello@weteego.com";

export function LandingFooterCTA() {
  return (
    <section
      className="border-t border-[var(--border-subtle)]/80 px-4 py-[var(--section-y)] md:px-8 lg:px-10"
      aria-labelledby="footer-cta-heading"
    >
      <div className="mx-auto max-w-6xl">
        <GlassCard size="lg" className="relative overflow-hidden shadow-landing-glow">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 20% 20%, rgba(0,212,255,0.14), transparent 50%), radial-gradient(ellipse 60% 60% at 90% 80%, rgba(255,184,0,0.1), transparent 55%)",
            }}
            aria-hidden
          />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div>
              <h2
                id="footer-cta-heading"
                className="font-display text-[clamp(1.75rem,4vw+0.5rem,2.75rem)] leading-tight tracking-tight text-white"
              >
                Move money at protocol speed.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
                Join the waitlist for mainnet corridor expansion, integrator APIs, and infrastructure updates—we read
                every note.
              </p>
              <motion.div className="mt-8" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/convert"
                  className="focus-ring inline-flex items-center justify-center rounded-xl bg-[var(--accent-cyan)] px-6 py-3 text-sm font-semibold text-[#041018] shadow-landing-lift hover:brightness-110"
                >
                  Open convert flow
                </Link>
              </motion.div>
            </div>

            <div>
              <form
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-glass)] bg-black/35 p-5 backdrop-blur-md"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const email = String(fd.get("email") ?? "");
                  const subject = encodeURIComponent("WeteEgo waitlist");
                  const body = encodeURIComponent(`Please add me to the waitlist.\n\nEmail: ${email}`);
                  window.location.href = `mailto:${WAITLIST_EMAIL}?subject=${subject}&body=${body}`;
                }}
              >
                <label htmlFor="waitlist-email" className="text-xs font-medium text-[var(--text-muted)]">
                  Email
                </label>
                <input
                  id="waitlist-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="focus-ring rounded-xl border border-[var(--border-glass)] bg-white/[0.06] px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="focus-ring mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--accent-gold)]/35 bg-[var(--accent-gold)]/15 px-4 py-3 text-sm font-semibold text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/25"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  Request access
                </motion.button>
                <p className="text-[11px] leading-snug text-[var(--text-muted)]">
                  Submits via your mail client—no account stored on this static form.
                </p>
              </form>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
