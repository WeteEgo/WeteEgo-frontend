import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/layout/SiteHeader";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WeteEgo — Stablecoin to fiat on Base",
    template: "%s · WeteEgo",
  },
  description:
    "Convert USDC to Nigerian Naira on Base. On-chain escrow, compliant settlement rails, and a path to a sovereign crypto–fiat protocol.",
  openGraph: {
    title: "WeteEgo — Stablecoin to fiat on Base",
    description:
      "USDC → NGN settlement: transparent flow from wallet to bank account, built on Base.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        <Providers>
          <div className="app-shell">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--bg-elevated)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:ring-offset-2 focus:ring-offset-[var(--bg-page)]"
            >
              Skip to main content
            </a>
            <SiteHeader />
            {children}
            <footer className="border-t border-[var(--border-glass)] py-6 text-xs text-[var(--text-muted)]">
              <div className="app-container flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
                <p>WeteEgo · Stablecoin to fiat on Base</p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                  <a
                    href={process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.weteego.com"}
                    className="focus-ring rounded text-[var(--text-muted)] hover:text-[var(--accent-cyan)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Docs
                  </a>
                  <a
                    href="https://github.com/WeteEgo"
                    className="focus-ring rounded text-[var(--text-muted)] hover:text-[var(--accent-cyan)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                  <Link href="/convert" className="focus-ring rounded text-[var(--accent-cyan)] hover:underline">
                    Convert
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
