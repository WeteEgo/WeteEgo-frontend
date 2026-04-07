"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlassCard } from "./GlassCard";
import { Building2, Droplets, Hexagon, Landmark, User } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const NODES = [
  { id: "user", label: "User", sub: "Wallet", Icon: User, highlight: false },
  { id: "weteego", label: "WeteEgo", sub: "Sender", Icon: Hexagon, highlight: true },
  { id: "paycrest", label: "Paycrest", sub: "Protocol", Icon: Building2, highlight: false },
  { id: "lp", label: "Liquidity", sub: "Nodes", Icon: Droplets, highlight: false },
  { id: "bank", label: "Bank", sub: "Fiat rail", Icon: Landmark, highlight: false },
] as const;

export function ProtocolStackSection() {
  const rootRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      const lines = svg.querySelectorAll<SVGGeometryElement>(".protocol-line");
      lines.forEach((line) => {
        const len = line.getTotalLength();
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.to(lines, {
        strokeDashoffset: 0,
        duration: 1.25,
        ease: "power2.inOut",
        stagger: 0.12,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 72%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="protocol"
      className="border-t border-[var(--border-subtle)]/80 px-4 py-[var(--section-y)] md:px-8 lg:px-10"
      aria-labelledby="protocol-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="protocol-heading"
          className="font-display text-3xl tracking-tight text-white md:text-4xl lg:text-[clamp(2rem,4vw+0.5rem,2.75rem)]"
        >
          Protocol stack
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
          User to bank, with WeteEgo as the Paycrest Sender—coordinating on-chain escrow and off-chain payout
          correlation today.
        </p>

        <div className="relative mt-14">
          <svg
            ref={svgRef}
            className="pointer-events-none absolute left-4 right-4 top-[52px] z-0 hidden h-[2px] md:block"
            viewBox="0 0 880 2"
            preserveAspectRatio="none"
            aria-hidden
          >
            <line
              className="protocol-line"
              x1="44"
              y1="1"
              x2="172"
              y2="1"
              stroke="url(#protoGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              className="protocol-line"
              x1="204"
              y1="1"
              x2="332"
              y2="1"
              stroke="url(#protoGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              className="protocol-line"
              x1="364"
              y1="1"
              x2="492"
              y2="1"
              stroke="url(#protoGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              className="protocol-line"
              x1="524"
              y1="1"
              x2="652"
              y2="1"
              stroke="url(#protoGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="protoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,212,255,0.2)" />
                <stop offset="50%" stopColor="rgba(0,212,255,0.95)" />
                <stop offset="100%" stopColor="rgba(255,184,0,0.5)" />
              </linearGradient>
            </defs>
          </svg>

          <ul className="relative z-10 grid list-none gap-4 md:grid-cols-5 md:gap-3">
            {NODES.map(({ id, label, sub, Icon, highlight }, i) => (
              <li key={id} className="min-w-0 md:pt-6">
                <GlassCard
                  size="sm"
                  className={`h-full ${
                    highlight
                      ? "border-[var(--accent-gold)]/35 shadow-[0_0_40px_rgba(255,184,0,0.08)]"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        highlight
                          ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]"
                          : "bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        Step {i + 1}
                      </p>
                      <h3 className="font-display text-base text-white">{label}</h3>
                      <p className="text-xs text-[var(--accent-cyan)]">{sub}</p>
                    </div>
                  </div>
                </GlassCard>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
