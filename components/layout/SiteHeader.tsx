"use client";

import Link from "next/link";
import { useAccount, useChainId } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

function shortAddress(addr: string | undefined) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const nav = [
  { href: "/#protocol", label: "Protocol" },
  { href: "/#why", label: "Why" },
  { href: "/#corridors", label: "Corridors" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#developers", label: "Developers" },
  { href: "/#trust", label: "Trust" },
] as const;

export function SiteHeader() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const currentChain =
    chainId === base.id ? "Base" : chainId === baseSepolia.id ? "Base Sepolia" : "Unknown";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-glass)] bg-[var(--bg-deep)]/75 backdrop-blur-md">
      <div className="app-container flex max-w-6xl flex-wrap items-center justify-between gap-4 py-3 md:py-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/" className="focus-ring flex min-w-0 items-center gap-2 rounded-lg outline-none">
            <span className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-gold)] shadow-[0_0_24px_rgba(0,212,255,0.2)]" />
            <span className="min-w-0">
              <span className="block font-display text-sm font-semibold tracking-tight text-white">WeteEgo</span>
              <span className="block truncate text-xs text-[var(--text-muted)]">USDC → fiat on Base</span>
            </span>
          </Link>
          <nav className="flex w-full max-w-full flex-wrap items-center gap-1 sm:w-auto" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-muted)] transition hover:text-[var(--text-main)] md:px-3"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/convert"
              className="focus-ring rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-cyan)] transition hover:text-[var(--accent-strong)] md:px-3"
            >
              Convert
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-glass)] bg-white/[0.04] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-green)]" aria-hidden />
            <span className="text-[var(--text-muted)]">Network</span>
            <span className="font-medium text-white">{currentChain}</span>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[var(--border-glass)] bg-white/[0.04] px-3 py-1">
            <span className="text-[var(--text-muted)]">{isConnected ? "Wallet" : "Not connected"}</span>
            {isConnected && <span className="font-mono text-white">{shortAddress(address)}</span>}
          </span>
        </div>
      </div>
    </header>
  );
}
