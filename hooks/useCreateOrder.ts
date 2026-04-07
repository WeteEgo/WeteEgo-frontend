"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { WETEEGO_GATEWAY_ABI } from "@/lib/contracts";
import { isBankAccountValid, type BankAccount } from "@/components/BankAccountForm";
import type { TxLifecycleState } from "@/lib/flow-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface CreateOrderResult {
  settlementRef: `0x${string}`;
  id: string;
  guestCheckout?: boolean;
}

interface UseCreateOrderReturn {
  lifecycleState: TxLifecycleState;
  txHash: `0x${string}` | undefined;
  error: Error | null;
  backendError: string | null;
  isCreatingOrder: boolean;
  orderResult: CreateOrderResult | null;
  submit: () => Promise<void>;
  reset: () => void;
}

async function createBackendOrder(params: {
  walletAddress: string;
  tokenAddress: string;
  amount: string;
  fiatCurrency: string;
  bankAccount?: { accountNumber: string; bankCode: string; accountName: string };
}): Promise<CreateOrderResult | { error: string; requiresKyc: boolean }> {
  if (!API_URL) {
    return { error: "Service temporarily unavailable.", requiresKyc: false };
  }
  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (res.status === 403 && json.error) {
      return { error: json.error, requiresKyc: json.requiresKyc ?? false };
    }
    if (!res.ok || !json.success || !json.data) {
      return { error: json.error ?? `Server error (${res.status}).`, requiresKyc: false };
    }
    return json.data as CreateOrderResult;
  } catch {
    return { error: "Could not reach the server. Please check your connection.", requiresKyc: false };
  }
}

export function useCreateOrder(params: {
  gatewayAddress: `0x${string}`;
  tokenAddress: `0x${string}` | undefined;
  walletAddress: `0x${string}` | undefined;
  amount: string;
  fiatCurrency: string;
  bankAccount: BankAccount;
}): UseCreateOrderReturn {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<CreateOrderResult | null>(null);

  const amountWei = params.amount ? parseUnits(params.amount, 6) : 0n;

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
  });

  const submit = async () => {
    if (!params.tokenAddress || !params.walletAddress || !params.amount) return;
    setBackendError(null);
    setIsCreatingOrder(true);

    const result = await createBackendOrder({
      walletAddress: params.walletAddress,
      tokenAddress: params.tokenAddress,
      amount: amountWei.toString(),
      fiatCurrency: params.fiatCurrency,
      bankAccount: isBankAccountValid(params.bankAccount) ? params.bankAccount : undefined,
    });

    setIsCreatingOrder(false);

    if ("error" in result) {
      setBackendError(result.error);
      return;
    }

    setOrderResult(result);

    writeContract({
      address: params.gatewayAddress,
      abi: WETEEGO_GATEWAY_ABI,
      functionName: "createOrder",
      args: [params.tokenAddress, amountWei, result.settlementRef, result.settlementRef],
    });
  };

  const reset = () => {
    resetWrite();
    setBackendError(null);
    setOrderResult(null);
    setIsCreatingOrder(false);
  };

  let lifecycleState: TxLifecycleState = "idle";
  if (isCreatingOrder || isPending) lifecycleState = "prompting";
  else if (isConfirming) lifecycleState = "confirming";
  else if (isSuccess) lifecycleState = "success";
  else if (writeError || backendError) lifecycleState = "error";

  return {
    lifecycleState,
    txHash,
    error: writeError,
    backendError,
    isCreatingOrder,
    orderResult,
    submit,
    reset,
  };
}
