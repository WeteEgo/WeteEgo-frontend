"use client";

import { useConnect } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";

export function ConnectWalletStep() {
  const { connectors, connect } = useConnect();

  return (
    <div className="flex flex-col items-center gap-6 py-8 animate-[fadeUp_0.2s_ease-out]">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-base font-semibold text-slate-100">Connect your wallet</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)] max-w-xs">
          Connect a wallet on Base to convert USDC to Nigerian Naira.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {connectors.map((c) => (
          <Button
            key={c.uid}
            variant="secondary"
            className="w-full"
            onClick={() => connect({ connector: c, chainId: baseSepolia.id })}
          >
            {c.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
