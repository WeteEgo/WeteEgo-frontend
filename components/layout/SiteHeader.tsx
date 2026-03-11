"use client";

import { useAccount, useChainId } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

function shortAddress(addr: string | undefined) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function SiteHeader() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const currentChain =
    chainId === base.id ? "Base" : chainId === baseSepolia.id ? "Base Sepolia" : "Unknown";

  return (
    <header className="border-b border-[var(--border-subtle)]/60 bg-black/30 backdrop-blur-sm">
      <div className="app-container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400" />
          <div>
            <div className="text-sm font-semibold tracking-tight">WeteEgo</div>
            <div className="text-xs text-[var(--text-muted)]">
              USDC → NGN settlement via Paycrest
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)]/80 bg-surface-inverted/40 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-[var(--text-muted)]">Network</span>
            <span className="font-medium text-slate-100">{currentChain}</span>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)]/80 bg-surface-muted/40 px-3 py-1">
            <span className="text-[var(--text-muted)]">
              {isConnected ? "Wallet" : "Not connected"}
            </span>
            {isConnected && (
              <span className="font-mono text-slate-100">{shortAddress(address)}</span>
            )}
          </span>
        </div>
      </div>
    </header>
  );
}

