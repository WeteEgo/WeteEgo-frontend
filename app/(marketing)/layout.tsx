import { MarketingShell } from "@/components/landing/MarketingShell";

/**
 * Marketing routes: Lenis + ScrollTrigger; full-bleed width; sections own max-width.
 * Single <main> for document semantics (fe-accessibility).
 */
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MarketingShell>
      <main id="main-content" className="min-h-0 flex-1 w-full outline-none">
        {children}
      </main>
    </MarketingShell>
  );
}
