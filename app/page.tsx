"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useBalance,
} from "wagmi";
import { parseUnits } from "viem";
import { useState, useEffect, useCallback } from "react";
import {
  WETEEGO_GATEWAY_ABI,
  ERC20_ABI,
  USDC_BASE_SEPOLIA,
  USDC_BASE,
  GATEWAY_BASE_SEPOLIA,
  GATEWAY_BASE,
} from "@/lib/contracts";
import { fetchQuote, type QuoteResult } from "@/lib/rates";
import BankAccountForm, {
  type BankAccount,
  isBankAccountValid,
} from "@/components/BankAccountForm";
import { baseSepolia, base } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Stepper } from "@/components/ui/stepper";

const USDC_BY_CHAIN: Record<number, string> = {
  [baseSepolia.id]: USDC_BASE_SEPOLIA,
  [base.id]: USDC_BASE,
};

const GATEWAY_BY_CHAIN: Record<number, string> = {
  [baseSepolia.id]: GATEWAY_BASE_SEPOLIA,
  [base.id]: GATEWAY_BASE,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface OrderStatus {
  id: string;
  settlementRef: string;
  status: "PENDING" | "FORWARDED" | "ESCROWED" | "EXPIRED" | "SETTLED" | "FAILED" | "REFUNDED";
  txHash?: string;
  guestCheckout?: boolean;
}

interface KycStatus {
  kycStatus: string;
  tier: string;
  verified: boolean;
}

async function fetchKycStatus(walletAddress: string): Promise<KycStatus | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/kyc/status/${walletAddress}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { success: boolean; data: KycStatus };
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

async function createOrder(params: {
  walletAddress: string;
  tokenAddress: string;
  amount: string;
  fiatCurrency: string;
  bankAccount?: { accountNumber: string; bankCode: string; accountName: string };
}): Promise<{ settlementRef: `0x${string}`; id: string; guestCheckout?: boolean } | { error: string; requiresKyc: boolean }> {
  if (!API_URL) {
    return {
      error: "Backend URL not set. Add NEXT_PUBLIC_API_URL=http://localhost:3001 to .env.local and restart the dev server.",
      requiresKyc: false,
    };
  }
  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const json = (await res.json()) as {
      success: boolean;
      data?: { settlementRef: `0x${string}`; id: string; guestCheckout?: boolean };
      error?: string;
      requiresKyc?: boolean;
    };
    if (res.status === 403 && json.error) {
      return { error: json.error, requiresKyc: json.requiresKyc ?? false };
    }
    if (!res.ok) {
      return {
        error: json.error ?? `Server error (${res.status}). Check backend logs.`,
        requiresKyc: json.requiresKyc ?? false,
      };
    }
    if (!json.success || !json.data) {
      return { error: json.error ?? "Failed to create order.", requiresKyc: false };
    }
    return json.data;
  } catch (e) {
    return {
      error: "Network error. Is the backend running at " + API_URL + "?",
      requiresKyc: false,
    };
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
  const [isRefetchingQuote, setIsRefetchingQuote] = useState(false);
  const [approvalDone, setApprovalDone] = useState(false);
  const [pendingAction, setPendingAction] = useState<"approve" | "convert" | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [guestCheckoutBadge, setGuestCheckoutBadge] = useState(false);

  const chainId = chain?.id ?? baseSepolia.id;
  const gatewayAddress = (GATEWAY_BY_CHAIN[chainId] ?? process.env.NEXT_PUBLIC_GATEWAY_ADDRESS ?? "") as `0x${string}`;
  const usdcAddress = USDC_BY_CHAIN[chainId] as `0x${string}` | undefined;

  const amountWei = amount ? parseUnits(amount, 6) : 0n;

  const { data: ethBalance } = useBalance({ address });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && gatewayAddress ? [address, gatewayAddress] : undefined,
    query: { refetchInterval: 3000 },  // poll every 3s — catches allowance change after approve tx
  });

  const needsApproval =
    gatewayAddress &&
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

  // Fetch KYC status when wallet connects
  useEffect(() => {
    if (!address) {
      setKycStatus(null);
      return;
    }
    fetchKycStatus(address).then(setKycStatus);
  }, [address]);

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

  // After approval tx confirms: refetch allowance so needsApproval flips to false
  useEffect(() => {
    if (isSuccess && pendingAction === "approve") {
      setApprovalDone(true);
      refetchAllowance();
    }
  }, [isSuccess, pendingAction]);

  // Start 60-second countdown when user reaches step 3
  useEffect(() => {
    if (step !== 3) { setQuoteSecondsLeft(null); return; }
    setQuoteSecondsLeft(60);
    const interval = setInterval(() => {
      setQuoteSecondsLeft((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Refetch quote every 30s on step 3 and reset countdown so user doesn't have to go back
  const refetchQuoteForStep3 = useCallback(async () => {
    const usdcNum = Number(amount);
    if (!amount || isNaN(usdcNum) || usdcNum <= 0) return;
    setIsRefetchingQuote(true);
    try {
      const q = await fetchQuote(usdcNum, fiatCurrency);
      setQuote(q);
      setQuoteSecondsLeft(60);
    } finally {
      setIsRefetchingQuote(false);
    }
  }, [amount, fiatCurrency]);

  useEffect(() => {
    if (step !== 3) return;
    const usdcNum = Number(amount);
    if (!amount || isNaN(usdcNum) || usdcNum <= 0) return;
    const interval = setInterval(refetchQuoteForStep3, 30_000);
    return () => clearInterval(interval);
  }, [step, amount, fiatCurrency, refetchQuoteForStep3]);

  const handleApprove = () => {
    if (!usdcAddress || !gatewayAddress || !amount) return;
    resetWrite();
    setOrderStatus(null);
    setApprovalDone(false);
    setPendingAction("approve");
    writeContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [gatewayAddress, parseUnits(amount, 6)],
    });
  };

  const handleConvert = async () => {
    if (!gatewayAddress || !usdcAddress || !amount || !address) return;
    resetWrite();
    setOrderStatus(null);
    setApprovalDone(false);
    setPendingAction("convert");

    setConvertError(null);
    // Try to create order in backend to get a meaningful settlementRef
    const order = await createOrder({
      walletAddress: address,
      tokenAddress: usdcAddress,
      amount: amountWei.toString(),
      fiatCurrency,
      bankAccount: isBankAccountValid(bankAccount) ? bankAccount : undefined,
    });

    if ("error" in order) {
      setConvertError(order.requiresKyc ? "Orders over $500 require KYC. Complete verification to continue." : order.error);
      return;
    }

    setGuestCheckoutBadge(order.guestCheckout ?? false);
    const ref = order.settlementRef;
    setSettlementRef(ref);

    // orderId = settlementRef (both are unique bytes32 generated by backend)
    writeContract({
      address: gatewayAddress,
      abi: WETEEGO_GATEWAY_ABI,
      functionName: "createOrder",
      args: [usdcAddress, amountWei, ref, ref],
    });
  };

  const blockExplorer =
    chainId === base.id ? "https://basescan.org" : "https://sepolia.basescan.org";

  const quoteLabel = quote
    ? `≈ ${quote.fiatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${quote.fiatCurrency}${quote.source === "fallback" ? " (estimated)" : ""}`
    : amount
      ? "Fetching quote..."
      : `1 USDC ≈ ${fiatCurrency === "NGN" ? "1,550" : "1"} ${fiatCurrency} (estimated)`;

  const activeStepId = step === 1 ? "amount" : step === 2 ? "bank" : "convert";

  return (
    <main className="py-10">
      <section className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Convert USDC to NGN</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Lock in a rate, approve USDC, and settle to a Nigerian bank account.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs">
          <span className="rounded-full bg-black/40 px-3 py-1 text-[var(--text-muted)]">
            {chain?.name ?? "Unknown chain"}
          </span>
          {isConnected ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => disconnect()}
              className="text-[var(--text-muted)]"
            >
              Disconnect
            </Button>
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              {connectors.map((c) => (
                <Button
                  key={c.uid}
                  size="sm"
                  onClick={() => connect({ connector: c, chainId: baseSepolia.id })}
                >
                  {c.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {!isConnected ? (
        <Card className="text-center text-sm text-[var(--text-muted)]">
          Connect your wallet on Base or Base Sepolia to start a conversion.
        </Card>
      ) : (
        <Card
          header={
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Conversion flow</h2>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  1. Enter amount · 2. Add bank · 3. Approve &amp; convert
                </p>
              </div>
              <Stepper
                steps={[
                  { id: "amount", label: "Amount" },
                  { id: "bank", label: "Bank" },
                  { id: "convert", label: "Convert" },
                ]}
                activeId={activeStepId}
              />
            </div>
          }
        >
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-200">
                    Amount (USDC)
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="mt-1 text-[0.7rem] text-[var(--text-muted)]">
                    You&apos;ll approve this amount in USDC before we create a conversion.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-200">
                    Receive (fiat)
                  </label>
                  <Select
                    value={fiatCurrency}
                    onChange={(e) => setFiatCurrency(e.target.value)}
                  >
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                  </Select>
                  <p className="mt-1 text-[0.7rem] text-[var(--text-muted)]">
                    NGN is optimised for Nigerian bank accounts. USD support is experimental.
                  </p>
                </div>
              </div>
              {Number(amount) > 500 && address && kycStatus && !kycStatus.verified && (
                <Alert variant="warning">
                  Orders over $500 require KYC. Complete verification to continue (you can still complete orders up to $500 as a guest).{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-inherit underline"
                    onClick={async () => {
                      if (!API_URL || !address) return;
                      try {
                        const res = await fetch(`${API_URL}/api/kyc/initiate`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ walletAddress: address, provider: "smileid" }),
                        });
                        const json = await res.json();
                        if (json?.data?.redirectUrl) window.open(json.data.redirectUrl, "_blank");
                        else if (json?.data?.alreadyVerified) fetchKycStatus(address).then(setKycStatus);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    Start KYC
                  </Button>
                </Alert>
              )}
              <p className="text-xs text-[var(--text-muted)]">Quote: {quoteLabel}</p>
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!amount || Number(amount) <= 0}
              >
                Next: Bank details
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <BankAccountForm value={bankAccount} onChange={setBankAccount} />
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="sm:w-auto"
                >
                  Back
                </Button>
                <Button
                  className="w-full sm:flex-1"
                  onClick={() => setStep(3)}
                  disabled={!isBankAccountValid(bankAccount)}
                >
                  Next: Approve &amp; convert
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {ethBalance !== undefined && ethBalance.value === 0n && (
                <Alert variant="warning">
                  You need a small amount of ETH on Base for gas.{" "}
                  <a
                    href="https://www.coinbase.com/buy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Get ETH on Coinbase
                  </a>
                </Alert>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-[var(--text-muted)]">Quote: {quoteLabel}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refetchQuoteForStep3}
                  disabled={isRefetchingQuote || !amount || Number(amount) <= 0}
                  className="text-xs"
                >
                  {isRefetchingQuote ? "Refreshing…" : "Refetch quote"}
                </Button>
              </div>
              {guestCheckoutBadge && (
                <span className="inline-block rounded bg-slate-600/60 px-2 py-0.5 text-[0.7rem] text-slate-300">
                  Guest checkout (≤$500)
                </span>
              )}
              {quoteSecondsLeft !== null && (
                <p
                  className={`text-xs ${
                    quoteSecondsLeft <= 10 ? "text-danger font-medium" : "text-[var(--text-muted)]"
                  }`}
                >
                  {quoteSecondsLeft > 0
                    ? `Rate locked for ${quoteSecondsLeft}s (refreshes every 30s)`
                    : "Quote expired — use Refetch quote or go back to re-quote"}
                </p>
              )}
              {convertError && (
                <Alert variant="error">
                  {convertError}
                </Alert>
              )}
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="mb-2"
                >
                  Back
                </Button>
              </div>
              {!gatewayAddress ? (
                <Alert variant="warning">
                  Set NEXT_PUBLIC_GATEWAY_ADDRESS in <code>.env</code> or <code>.env.local</code> after deploying
                  WeteEgo-Contracts.
                </Alert>
              ) : (
                <>
                  {/* Step A: Approval */}
                  {needsApproval && !approvalDone && (
                    <>
                      <p className="text-xs text-[var(--text-muted)]">
                        Step 1 of 2 — Approve the Gateway to spend your USDC.
                      </p>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleApprove}
                        disabled={!amount || isWritePending || isConfirming}
                      >
                        {isWritePending && pendingAction === "approve" ? "Waiting for wallet..." : isConfirming && pendingAction === "approve" ? "Confirming..." : "Step 1: Approve USDC"}
                      </Button>
                    </>
                  )}

                  {/* Approval success banner */}
                  {approvalDone && pendingAction === "approve" && txHash && (
                    <Alert variant="success">
                      USDC approved.{" "}
                      <a href={`${blockExplorer}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                        View tx
                      </a>
                      {" "}— now click Convert below.
                    </Alert>
                  )}

                  {/* Step B: Convert (shown once approval is no longer needed) */}
                  {!needsApproval && (
                    <>
                      <p className="text-xs text-[var(--text-muted)]">
                        Step 2 of 2 — Send USDC to the Gateway escrow to start settlement.
                      </p>
                      <Button
                        className="w-full"
                        onClick={handleConvert}
                        disabled={
                          !amount ||
                          isWritePending ||
                          isConfirming ||
                          !usdcAddress ||
                          quoteSecondsLeft === 0
                        }
                      >
                        {isWritePending && pendingAction === "convert" ? "Waiting for wallet..." : isConfirming && pendingAction === "convert" ? "Confirming..." : "Step 2: Convert"}
                      </Button>
                    </>
                  )}

                  {writeError && (
                    <Alert variant="error" className="mt-3">
                      {writeError.message}
                    </Alert>
                  )}

                  {/* Settlement tracking — shown after convert tx confirms */}
                  {isSuccess && pendingAction === "convert" && txHash && (
                    <div className="space-y-2 text-xs">
                      <Alert variant="success">
                        On-chain transaction confirmed.{" "}
                        <a
                          href={`${blockExplorer}/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          View on Basescan
                        </a>
                      </Alert>
                      <div className="rounded border border-slate-700 bg-black/20 p-3 space-y-1">
                        <p className="font-medium text-slate-200">Settlement status</p>
                        {!orderStatus && settlementRef && (
                          <p className="text-[var(--text-muted)] flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                            Waiting for USDC escrow to be detected...
                          </p>
                        )}
                        {orderStatus && (
                          <>
                            <p className="text-[var(--text-muted)]">
                              Status:{" "}
                              <span
                                className={
                                  orderStatus.status === "SETTLED"
                                    ? "text-success font-medium"
                                    : orderStatus.status === "FAILED" || orderStatus.status === "EXPIRED"
                                      ? "text-danger font-medium"
                                      : orderStatus.status === "ESCROWED"
                                        ? "text-yellow-400 font-medium"
                                        : "text-warning"
                                }
                              >
                                {orderStatus.status === "PENDING" && "Pending on-chain..."}
                                {orderStatus.status === "ESCROWED" && "Escrowed — Paycrest is processing your NGN payout"}
                                {orderStatus.status === "SETTLED" && "Settled — NGN sent to your bank account"}
                                {orderStatus.status === "FAILED" && "Settlement failed — funds will be refunded"}
                                {orderStatus.status === "EXPIRED" && "Order expired — funds will be refunded on-chain"}
                                {orderStatus.status === "REFUNDED" && "Refunded to your wallet"}
                                {!["PENDING","ESCROWED","SETTLED","FAILED","EXPIRED","REFUNDED"].includes(orderStatus.status) && orderStatus.status}
                              </span>
                            </p>
                            {orderStatus.txHash && (
                              <p className="text-[var(--text-muted)]">
                                Escrow tx:{" "}
                                <a href={`${blockExplorer}/tx/${orderStatus.txHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                                  {orderStatus.txHash.slice(0, 10)}...
                                </a>
                              </p>
                            )}
                            <p className="text-[var(--text-muted)]">
                              Ref: <code className="text-[0.65rem]">{settlementRef?.slice(0, 18)}...</code>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Card>
      )}
    </main>
  );
}
