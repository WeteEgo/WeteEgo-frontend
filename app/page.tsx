"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits } from "viem";
import { useState } from "react";
import {
  WETEEGO_ROUTER_ABI,
  ERC20_ABI,
  USDC_BASE_SEPOLIA,
  USDC_BASE,
} from "@/lib/contracts";
import { formatQuote } from "@/lib/rates";
import { baseSepolia, base } from "wagmi/chains";

const USDC_BY_CHAIN: Record<number, string> = {
  [baseSepolia.id]: USDC_BASE_SEPOLIA,
  [base.id]: USDC_BASE,
};

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const [amount, setAmount] = useState("");
  const [fiatCurrency, setFiatCurrency] = useState("NGN");

  const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS as `0x${string}`;
  const chainId = chain?.id ?? baseSepolia.id;
  const usdcAddress = USDC_BY_CHAIN[chainId] as `0x${string}` | undefined;

  const amountWei = amount ? parseUnits(amount, 6) : 0n;
  const { data: allowance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && routerAddress ? [address, routerAddress] : undefined,
  });
  const needsApproval =
    routerAddress &&
    usdcAddress &&
    amountWei > 0n &&
    (allowance === undefined || allowance < amountWei);

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: hash ?? undefined });

  const handleApprove = () => {
    if (!usdcAddress || !routerAddress || !amount) return;
    writeContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [routerAddress, parseUnits(amount, 6)],
    });
  };

  const handleConvert = () => {
    if (!routerAddress || !usdcAddress || !amount) return;
    const settlementRef =
      "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
    writeContract(
      {
        address: routerAddress,
        abi: WETEEGO_ROUTER_ABI,
        functionName: "forwardERC20",
        args: [usdcAddress, amountWei, settlementRef],
      },
      {
        onSuccess: (h) => setTxHash(h),
      }
    );
  };

  const blockExplorer =
    chainId === base.id
      ? "https://basescan.org"
      : "https://sepolia.basescan.org";

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-xl font-semibold">WeteEgo</h1>
        {isConnected ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {chain?.name ?? "Unknown chain"}
            </span>
            {chain && chain.id !== baseSepolia.id && chain.id !== base.id && (
              <button
                type="button"
                onClick={() => switchChain({ chainId: baseSepolia.id })}
                className="text-sm text-blue-600 hover:underline"
              >
                Switch to Base
              </button>
            )}
            <button
              type="button"
              onClick={() => disconnect()}
              className="text-sm px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            {connectors.map((c) => (
              <button
                key={c.uid}
                type="button"
                onClick={() => connect({ connector: c, chainId: baseSepolia.id })}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </header>

      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Convert USDC on Base to fiat. Settlement powered by Paycrest.
      </p>

      {!isConnected ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500">
          Connect your wallet to continue.
        </div>
      ) : (
        <div className="space-y-6 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount (USDC)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Receive (fiat)
            </label>
            <select
              value={fiatCurrency}
              onChange={(e) => setFiatCurrency(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Quote: {amount ? formatQuote(Number(amount), fiatCurrency) : `1 USDC ≈ ${fiatCurrency === "NGN" ? "1,550" : "1"} ${fiatCurrency} (placeholder)`}
          </div>
          {!routerAddress || routerAddress === "0x..." ? (
            <p className="text-amber-600 text-sm">
              Set NEXT_PUBLIC_ROUTER_ADDRESS in .env.local after deploying
              WeteEgo-Contracts.
            </p>
          ) : (
            <>
              {needsApproval ? (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={!amount || isWritePending || isConfirming}
                  className="w-full py-3 rounded bg-gray-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                  {isWritePending || isConfirming ? "Confirming..." : "Approve USDC"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={
                    !amount ||
                    isWritePending ||
                    isConfirming ||
                    !usdcAddress
                  }
                  className="w-full py-3 rounded bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                >
                  {isWritePending || isConfirming
                    ? "Confirming..."
                    : "Convert"}
                </button>
              )}
              {writeError && (
                <p className="text-red-600 text-sm">{writeError.message}</p>
              )}
              {isSuccess && hash && (
                <p className="text-green-600 text-sm">
                  Success.{" "}
                  <a
                    href={`${blockExplorer}/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View on Basescan
                  </a>
                </p>
              )}
            </>
          )}
        </div>
      )}

      <footer className="mt-12 text-center text-sm text-gray-500">
        <a
          href="https://github.com/WeteEgo"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          WeteEgo
        </a>{" "}
        · Settlement via{" "}
        <a
          href="https://paycrest.io"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Paycrest
        </a>
      </footer>
    </main>
  );
}
