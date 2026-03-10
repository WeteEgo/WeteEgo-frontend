"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useBalance,
} from "wagmi";
import { parseUnits } from "viem";
import { useState, useEffect } from "react";
import {
  WETEEGO_ROUTER_ABI,
  ERC20_ABI,
  USDC_BASE_SEPOLIA,
  USDC_BASE,
} from "@/lib/contracts";
import { fetchQuote, type QuoteResult } from "@/lib/rates";
import BankAccountForm, {
  type BankAccount,
  isBankAccountValid,
} from "@/components/BankAccountForm";
import { baseSepolia, base } from "wagmi/chains";

const USDC_BY_CHAIN: Record<number, string> = {
  [baseSepolia.id]: USDC_BASE_SEPOLIA,
  [base.id]: USDC_BASE,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface OrderStatus {
  id: string;
  settlementRef: string;
  status: "PENDING" | "FORWARDED" | "ESCROWED" | "EXPIRED" | "SETTLED" | "FAILED";
  txHash?: string;
}

async function createOrder(params: {
  walletAddress: string;
  tokenAddress: string;
  amount: string;
  fiatCurrency: string;
  bankAccount?: { accountNumber: string; bankCode: string; accountName: string };
}): Promise<{ settlementRef: `0x${string}`; id: string } | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success: boolean;
      data: { settlementRef: `0x${string}`; id: string };
    };
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

async function pollOrderStatus(ref: string): Promise<OrderStatus | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/orders/${ref}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data: OrderStatus };
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState("");
  const [fiatCurrency, setFiatCurrency] = useState("NGN");
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    accountNumber: "",
    bankCode: "GTBINGLA",
    accountName: "",
  });
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [settlementRef, setSettlementRef] = useState<`0x${string}` | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [quoteSecondsLeft, setQuoteSecondsLeft] = useState<number | null>(null);

  const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS as `0x${string}`;
  const chainId = chain?.id ?? baseSepolia.id;
  const usdcAddress = USDC_BY_CHAIN[chainId] as `0x${string}` | undefined;

  const amountWei = amount ? parseUnits(amount, 6) : 0n;

  const { data: ethBalance } = useBalance({ address });
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
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
  });

  // Fetch live quote when amount or currency changes
  useEffect(() => {
    const usdcNum = Number(amount);
    if (!amount || isNaN(usdcNum) || usdcNum <= 0) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    fetchQuote(usdcNum, fiatCurrency).then((q) => {
      if (!cancelled) setQuote(q);
    });
    return () => {
      cancelled = true;
    };
  }, [amount, fiatCurrency]);

  // Poll order status after tx is confirmed
  useEffect(() => {
    if (!isSuccess || !settlementRef) return;
    const interval = setInterval(async () => {
      const status = await pollOrderStatus(settlementRef);
      if (status) {
        setOrderStatus(status);
        if (status.status === "SETTLED" || status.status === "FAILED") {
          clearInterval(interval);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isSuccess, settlementRef]);

  // Start 60-second countdown when user reaches step 3
  useEffect(() => {
    if (step !== 3) { setQuoteSecondsLeft(null); return; }
    setQuoteSecondsLeft(60);
    const interval = setInterval(() => {
      setQuoteSecondsLeft((prev) => {
        if (prev === null || prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleApprove = () => {
    if (!usdcAddress || !routerAddress || !amount) return;
    resetWrite();
    setOrderStatus(null);
    writeContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [routerAddress, parseUnits(amount, 6)],
    });
  };

  const handleConvert = async () => {
    if (!routerAddress || !usdcAddress || !amount || !address) return;
    resetWrite();
    setOrderStatus(null);

    setConvertError(null);
    // Try to create order in backend to get a meaningful settlementRef
    const order = await createOrder({
      walletAddress: address,
      tokenAddress: usdcAddress,
      amount: amountWei.toString(),
      fiatCurrency,
      bankAccount: isBankAccountValid(bankAccount) ? bankAccount : undefined,
    });

    if (!order) {
      setConvertError("Failed to create order. Please try again.");
      return;
    }

    const ref = order.settlementRef;
    setSettlementRef(ref);

    writeContract({
      address: routerAddress,
      abi: WETEEGO_ROUTER_ABI,
      functionName: "forwardERC20",
      args: [usdcAddress, amountWei, ref],
    });
  };

  const blockExplorer =
    chainId === base.id ? "https://basescan.org" : "https://sepolia.basescan.org";

  const quoteLabel = quote
    ? `≈ ${quote.fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${quote.fiatCurrency}${quote.source === "fallback" ? " (estimated)" : ""}`
    : amount
      ? "Fetching quote..."
      : `1 USDC ≈ ${fiatCurrency === "NGN" ? "1,550" : "1"} ${fiatCurrency} (estimated)`;

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-xl font-semibold">WeteEgo</h1>
        {isConnected ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{chain?.name ?? "Unknown chain"}</span>
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
          <div className="flex gap-2 text-sm">
            <span className={step >= 1 ? "font-medium text-blue-600" : "text-gray-400"}>1. Amount</span>
            <span className="text-gray-300">→</span>
            <span className={step >= 2 ? "font-medium text-blue-600" : "text-gray-400"}>2. Bank</span>
            <span className="text-gray-300">→</span>
            <span className={step >= 3 ? "font-medium text-blue-600" : "text-gray-400"}>3. Convert</span>
          </div>

          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (USDC)</label>
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
                <label className="block text-sm font-medium mb-1">Receive (fiat)</label>
                <select
                  value={fiatCurrency}
                  onChange={(e) => setFiatCurrency(e.target.value)}
                  className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">Quote: {quoteLabel}</div>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!amount || Number(amount) <= 0}
                className="w-full py-3 rounded bg-blue-600 text-white font-medium disabled:opacity-50"
              >
                Next: Bank details
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <BankAccountForm value={bankAccount} onChange={setBankAccount} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded border border-gray-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!isBankAccountValid(bankAccount)}
                  className="flex-1 py-3 rounded bg-blue-600 text-white font-medium disabled:opacity-50"
                >
                  Next: Approve & Convert
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {ethBalance !== undefined && Number(ethBalance.value) === 0n && (
                <p className="text-amber-600 text-sm">
                  You need a small amount of ETH on Base for gas.{" "}
                  <a
                    href="https://www.coinbase.com/buy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Get ETH on Coinbase
                  </a>
                </p>
              )}
              <div className="text-sm text-gray-500">Quote: {quoteLabel}</div>
              {quoteSecondsLeft !== null && (
                <p className={`text-sm ${quoteSecondsLeft <= 10 ? "text-red-500 font-medium" : "text-gray-500"}`}>
                  {quoteSecondsLeft > 0
                    ? `Rate locked for ${quoteSecondsLeft}s`
                    : "Quote expired — go back to re-quote"}
                </p>
              )}
              {convertError && (
                <p className="text-red-600 text-sm">{convertError}</p>
              )}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm px-3 py-1 rounded border border-gray-300 mb-2"
              >
                Back
              </button>
              {!routerAddress || routerAddress === "0x..." ? (
                <p className="text-amber-600 text-sm">
                  Set NEXT_PUBLIC_ROUTER_ADDRESS in .env.local after deploying WeteEgo-Contracts.
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
                      disabled={!amount || isWritePending || isConfirming || !usdcAddress || quoteSecondsLeft === 0}
                      className="w-full py-3 rounded bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                      {isWritePending || isConfirming ? "Confirming..." : "Convert"}
                    </button>
                  )}
                  {writeError && (
                    <p className="text-red-600 text-sm">{writeError.message}</p>
                  )}
                  {isSuccess && txHash && (
                    <div className="space-y-1">
                      <p className="text-green-600 text-sm">
                        Transaction confirmed.{" "}
                        <a
                          href={`${blockExplorer}/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          View on Basescan
                        </a>
                      </p>
                      {orderStatus && (
                        <p className="text-sm text-gray-500">
                          Settlement status:{" "}
                          <span
                            className={
                              orderStatus.status === "SETTLED"
                                ? "text-green-600"
                                : orderStatus.status === "FAILED" || orderStatus.status === "EXPIRED"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                            }
                          >
                            {orderStatus.status}
                          </span>
                        </p>
                      )}
                      {isSuccess && !orderStatus && settlementRef && (
                        <p className="text-sm text-gray-400">Waiting for settlement...</p>
                      )}
                    </div>
                  )}
                </>
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
