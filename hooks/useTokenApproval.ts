"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { ERC20_ABI } from "@/lib/contracts";
import type { TxLifecycleState } from "@/lib/flow-types";

interface UseTokenApprovalOptions {
  tokenAddress: `0x${string}` | undefined;
  spenderAddress: `0x${string}` | undefined;
  ownerAddress: `0x${string}` | undefined;
  amount: string;
}

interface UseTokenApprovalReturn {
  needsApproval: boolean;
  lifecycleState: TxLifecycleState;
  txHash: `0x${string}` | undefined;
  error: Error | null;
  approve: () => void;
  reset: () => void;
}

export function useTokenApproval({
  tokenAddress,
  spenderAddress,
  ownerAddress,
  amount,
}: UseTokenApprovalOptions): UseTokenApprovalReturn {
  const amountWei = amount ? parseUnits(amount, 6) : 0n;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
    query: { refetchInterval: 3000 },
  });

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

  // Refetch allowance after confirmation
  if (isSuccess && txHash) {
    refetchAllowance();
  }

  const needsApproval =
    !!spenderAddress &&
    !!tokenAddress &&
    amountWei > 0n &&
    (allowance === undefined || (allowance as bigint) < amountWei);

  const approve = () => {
    if (!tokenAddress || !spenderAddress || !amount) return;
    resetWrite();
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spenderAddress, parseUnits(amount, 6)],
    });
  };

  let lifecycleState: TxLifecycleState = "idle";
  if (isPending) lifecycleState = "prompting";
  else if (isConfirming) lifecycleState = "confirming";
  else if (isSuccess) lifecycleState = "success";
  else if (writeError) lifecycleState = "error";

  return {
    needsApproval,
    lifecycleState,
    txHash,
    error: writeError,
    approve,
    reset: resetWrite,
  };
}
