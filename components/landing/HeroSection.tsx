"use client";

/**
 * Hero: sovereign glass, GSAP headline stagger, Framer glows, dual CTA + preview widget.
 */
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { motion, useReducedMotion } from "framer-motion";
import { GlowBackdrop } from "./GlowBackdrop";
import { ConversionPreview } from "./ConversionPreview";

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.weteego.com";

/**
 * Word-level wraps preserve normal line-breaking (spaces stay breakable).
 * Per-character + nbsp made the headline one long unbreakable run and caused
 * mid-word wraps and flaky layout at intermediate viewports.
 */
function splitHeadlineWords(el: HTMLElement): HTMLElement[] {
  const text = (el.textContent ?? "").trim();
  if (!text) return [];
  const words = text.split(/\s+/);
  el.innerHTML = words
    .map(
      (word) =>
        `<span class="hero-word inline-block will-change-transform">${word}</span>`
    )
    .join(" ");
  return Array.from(el.querySelectorAll<HTMLElement>(".hero-word"));
}

export function HeroSection() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (reduce) return;
      const h = headlineRef.current;
      const sub = sublineRef.current;
      if (!h) return;
      const words = splitHeadlineWords(h);
      if (words.length === 0) return;
      gsap.set(words, { opacity: 0, y: 36 });
      gsap.to(words, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.06,
      });
      if (sub) {
        gsap.fromTo(
          sub,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.65, ease: "power3.out", delay: 0.4 }
        );
      }
    },
    { scope: rootRef, dependencies: [reduce] }
  );

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-4 pb-20 pt-16 md:px-8 md:pb-24 md:pt-20 lg:px-10"
      aria-labelledby="hero-heading"
    >
      <GlowBackdrop />

      <div ref={rootRef} className="relative mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr,minmax(280px,400px)] lg:gap-14">
          <div className="min-w-0">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-glass)] bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent-cyan)] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" aria-hidden />
              Paycrest Sender → sovereign rails
            </p>

            <h1
              ref={headlineRef}
              id="hero-heading"
              className="font-display max-w-full text-pretty text-[clamp(2rem,4.2vw+0.85rem,3.75rem)] leading-[1.12] tracking-tight text-white sm:max-w-2xl md:max-w-3xl lg:max-w-4xl lg:text-[clamp(2.5rem,4vw+0.75rem,4.25rem)] lg:leading-[1.1]"
            >
              Move money at protocol speed.
            </h1>

            <p
              ref={sublineRef}
              className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] md:text-lg"
            >
              Stablecoin in your wallet, fiat in their bank—starting with{" "}
              <strong className="font-medium text-[var(--text-main)]">USDC → NGN on Base</strong>.
              On-chain escrow, compliant settlement, and a path to rails you own.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/convert"
                  className="focus-ring inline-flex items-center justify-center rounded-xl bg-[var(--accent-cyan)] px-6 py-3 text-sm font-semibold text-[#041018] shadow-landing-lift transition hover:brightness-110"
                >
                  Start converting
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex items-center justify-center rounded-xl border border-[var(--border-glass)] bg-white/[0.04] px-6 py-3 text-sm font-medium text-[var(--text-main)] backdrop-blur-sm transition hover:border-[var(--accent-cyan)]/35 hover:bg-white/[0.08]"
                >
                  Read the docs
                </a>
              </motion.div>
              <a
                href="#protocol"
                className="focus-ring text-sm font-medium text-[var(--text-muted)] underline-offset-4 hover:text-[var(--accent-cyan)] hover:underline"
              >
                Protocol stack
              </a>
            </div>

            <p className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
              <span>Built on Base</span>
              <span aria-hidden className="text-[var(--border-glass)]">
                ·
              </span>
              <span>Powered by Paycrest</span>
              <span aria-hidden className="text-[var(--border-glass)]">
                ·
              </span>
              <span>Non-custodial escrow</span>
            </p>
          </div>

          <div className="relative w-full justify-self-center lg:justify-self-end">
            <ConversionPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
