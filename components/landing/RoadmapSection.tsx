"use client";

/**
 * Roadmap: four phases as staggered cards. Use embedded inside Trust to avoid duplicate section chrome.
 */
import { Reveal } from "./Reveal";

const phases = [
  {
    phase: "Phase 1",
    name: "Foundation",
    horizon: "Months 1–3",
    goal: "Paycrest sender + gateway contract + order service. Internal alpha, monitoring live.",
    accent: "from-[var(--accent-cyan)]/25 to-transparent",
  },
  {
    phase: "Phase 2",
    name: "Production",
    horizon: "Months 4–6",
    goal: "Own PSP rails, public beta, audited contracts, SDK and docs for integrators.",
    accent: "from-[var(--accent-gold)]/20 to-transparent",
  },
  {
    phase: "Phase 3",
    name: "Scale",
    horizon: "Months 7–12",
    goal: "Tiered LP network, multi-chain, new corridors (GHS, KES), enterprise-grade SLAs.",
    accent: "from-sky-500/20 to-transparent",
  },
  {
    phase: "Phase 4",
    name: "Protocol",
    horizon: "Year 2+",
    goal: "Open aggregation, governance, external routing—WeteEgo as infrastructure others build on.",
    accent: "from-cyan-700/25 to-transparent",
  },
] as const;

export function RoadmapSection({ embedded = false }: { embedded?: boolean }) {
  const inner = (
    <>
      {!embedded && (
        <Reveal>
          <h2
            id="roadmap-heading"
            className="font-display text-3xl tracking-tight text-white md:text-4xl lg:text-[clamp(2rem,4vw+0.5rem,2.75rem)]"
          >
            Where we are headed
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
            A staged path from integrated settlement today to a sovereign crypto–fiat protocol—without pretending
            overnight decentralization.
          </p>
        </Reveal>
      )}
      {embedded && (
        <Reveal>
          <h2
            id="roadmap-heading"
            className="font-display text-2xl tracking-tight text-white md:text-3xl"
          >
            Roadmap
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Phased delivery from sender today to open infrastructure—aligned with the master build plan.
          </p>
        </Reveal>
      )}

      <ol className={`grid list-none gap-8 md:gap-10 ${embedded ? "mt-10" : "mt-14"}`}>
        {phases.map((p, i) => (
          <Reveal key={p.phase} delay={i * 0.06} y={32}>
            <li
              className={`relative rounded-[var(--radius-feature)] border border-[var(--border-subtle)]/70 bg-[var(--bg-card)]/60 p-6 md:p-8 ${
                i % 2 === 1 ? "md:ml-12 md:mr-0" : "md:mr-12 md:ml-0"
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-0 rounded-[var(--radius-feature)] bg-gradient-to-br ${p.accent} opacity-80`}
                aria-hidden
              />
              <div className="relative flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-cyan)]">{p.phase}</p>
                  <h3 className="font-display mt-1 text-2xl text-white">{p.name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{p.horizon}</p>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)] md:text-right md:leading-relaxed">
                  {p.goal}
                </p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </>
  );

  if (embedded) {
    return (
      <div id="roadmap" aria-labelledby="roadmap-heading">
        {inner}
      </div>
    );
  }

  return (
    <section
      id="roadmap"
      className="border-t border-[var(--border-subtle)]/50 px-4 py-[var(--section-y)] md:px-8 lg:px-10"
      aria-labelledby="roadmap-heading"
    >
      <div className="mx-auto max-w-6xl">{inner}</div>
    </section>
  );
}
