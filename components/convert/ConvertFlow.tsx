"use client";

import { useCallback, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import {
  USDC_BASE_SEPOLIA,
  USDC_BASE,
  GATEWAY_BASE_SEPOLIA,
  GATEWAY_BASE,
} from "@/lib/contracts";
import { useConvertFlow } from "@/hooks/useConvertFlow";
import { useQuote } from "@/hooks/useQuote";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useSettlementPolling } from "@/hooks/useSettlementPolling";
import { NIGERIAN_BANKS } from "@/components/BankAccountForm";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { FlowStepper } from "@/components/convert/shared/FlowStepper";
import { ConnectWalletStep } from "@/components/convert/steps/ConnectWalletStep";
import { EnterAmountStep } from "@/components/convert/steps/EnterAmountStep";
import { BankDetailsStep } from "@/components/convert/steps/BankDetailsStep";
import { ReviewOrderStep } from "@/components/convert/steps/ReviewOrderStep";
import { ApproveStep } from "@/components/convert/steps/ApproveStep";
import { ConvertStep } from "@/components/convert/steps/ConvertStep";
import { SettlementTracker } from "@/components/convert/steps/SettlementTracker";

const USDC_BY_CHAIN: Record<number, string> = {
  [baseSepolia.id]: USDC_BASE_SEPOLIA,
  [base.id]: USDC_BASE,
};

const GATEWAY_BY_CHAIN: Record<number, string> = {
  [baseSepolia.id]: GATEWAY_BASE_SEPOLIA,
  [base.id]: GATEWAY_BASE,
};

export function ConvertFlow() {
  const { address, isConnected, chain } = useAccount();

  const chainId = chain?.id ?? baseSepolia.id;
  const gatewayAddress = (GATEWAY_BY_CHAIN[chainId] ?? process.env.NEXT_PUBLIC_GATEWAY_ADDRESS ?? "") as `0x${string}`;
  const usdcAddress = USDC_BY_CHAIN[chainId] as `0x${string}` | undefined;
  const explorerUrl = chainId === base.id ? "https://basescan.org" : "https://sepolia.basescan.org";

  const { state, dispatch, goTo, goBack, reset } = useConvertFlow(isConnected);

  // Sync wallet connection state
  useEffect(() => {
    if (isConnected && state.step === "connect") {
      goTo("amount");
    }
    if (!isConnected && state.step !== "connect") {
      goTo("connect");
    }
  }, [isConnected, state.step, goTo]);

  const { data: ethBalance } = useBalance({ address });

  // Quote management
  const countdownActive = ["review", "approve", "convert"].includes(state.step);
  const { quote, secondsLeft, isRefetching, expired, refetch } = useQuote({
    amount: state.amount,
    fiatCurrency: state.fiatCurrency,
    countdownActive,
  });

  // Sync quote to flow state
  useEffect(() => {
    if (quote) dispatch({ type: "SET_QUOTE", quote });
  }, [quote, dispatch]);

  // Token approval
  const approval = useTokenApproval({
    tokenAddress: usdcAddress,
    spenderAddress: gatewayAddress || undefined,
    ownerAddress: address,
    amount: state.amount,
  });

  // Create order
  const createOrder = useCreateOrder({
    gatewayAddress: gatewayAddress as `0x${string}`,
    tokenAddress: usdcAddress,
    walletAddress: address,
    amount: state.amount,
    fiatCurrency: state.fiatCurrency,
    bankAccount: state.bankAccount,
  });

  // Settlement polling
  const bankName = NIGERIAN_BANKS.find((b) => b.code === state.bankAccount.bankCode)?.name;
  const { orderStatus, timeline, isTerminal } = useSettlementPolling({
    settlementRef: state.settlementRef,
    enabled: state.step === "tracking",
    bankName,
  });

  useEffect(() => {
    if (orderStatus) dispatch({ type: "ORDER_UPDATE", status: orderStatus });
  }, [orderStatus, dispatch]);

  // Navigation handlers
  const handleReviewConfirm = useCallback(() => {
    if (approval.needsApproval) {
      goTo("approve");
    } else {
      goTo("convert");
    }
  }, [approval.needsApproval, goTo]);

  const handleApproveDone = useCallback(() => {
    goTo("convert");
  }, [goTo]);

  const handleConvertDone = useCallback(() => {
    if (createOrder.orderResult) {
      dispatch({
        type: "CONVERT_DONE",
        settlementRef: createOrder.orderResult.settlementRef,
        orderId: createOrder.orderResult.id,
        txHash: createOrder.txHash!,
        guestCheckout: createOrder.orderResult.guestCheckout ?? false,
      });
    }
  }, [createOrder.orderResult, createOrder.txHash, dispatch]);

  const header = state.step !== "connect" ? (
    <FlowStepper currentStep={state.step} />
  ) : undefined;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Gas warning */}
      {isConnected && ethBalance !== undefined && ethBalance.value === 0n && state.step !== "connect" && state.step !== "tracking" && (
        <Alert variant="warning" className="mb-4">
          You need ETH on Base for gas fees.{" "}
          <a href="https://www.coinbase.com/buy" target="_blank" rel="noopener noreferrer" className="underline">
            Get ETH
          </a>
        </Alert>
      )}

      <Card header={header}>
        {state.step === "connect" && <ConnectWalletStep />}

        {state.step === "amount" && (
          <EnterAmountStep
            amount={state.amount}
            fiatCurrency={state.fiatCurrency}
            quote={quote}
            onAmountChange={(v) => dispatch({ type: "SET_AMOUNT", amount: v, fiatCurrency: state.fiatCurrency })}
            onCurrencyChange={(v) => dispatch({ type: "SET_AMOUNT", amount: state.amount, fiatCurrency: v })}
            onNext={() => goTo("bank")}
          />
        )}

        {state.step === "bank" && (
          <BankDetailsStep
            bankAccount={state.bankAccount}
            onChange={(v) => dispatch({ type: "SET_BANK", bankAccount: v })}
            onNext={() => goTo("review")}
            onBack={goBack}
          />
        )}

        {state.step === "review" && (
          <ReviewOrderStep
            amount={state.amount}
            fiatCurrency={state.fiatCurrency}
            bankAccount={state.bankAccount}
            quote={quote}
            secondsLeft={secondsLeft}
            isRefetching={isRefetching}
            expired={expired}
            onRefetch={refetch}
            onConfirm={handleReviewConfirm}
            onBack={goBack}
          />
        )}

        {state.step === "approve" && (
          <ApproveStep
            amount={state.amount}
            quote={quote}
            secondsLeft={secondsLeft}
            isRefetching={isRefetching}
            onRefetch={refetch}
            explorerUrl={explorerUrl}
            lifecycleState={approval.lifecycleState}
            txHash={approval.txHash}
            error={approval.error}
            onApprove={approval.approve}
            onRetry={approval.reset}
            onDone={handleApproveDone}
            onBack={goBack}
          />
        )}

        {state.step === "convert" && (
          <ConvertStep
            amount={state.amount}
            quote={quote}
            secondsLeft={secondsLeft}
            isRefetching={isRefetching}
            expired={expired}
            onRefetch={refetch}
            explorerUrl={explorerUrl}
            skippedApproval={!approval.needsApproval}
            lifecycleState={createOrder.lifecycleState}
            txHash={createOrder.txHash}
            error={createOrder.error}
            backendError={createOrder.backendError}
            isCreatingOrder={createOrder.isCreatingOrder}
            onSubmit={createOrder.submit}
            onRetry={createOrder.reset}
            onDone={handleConvertDone}
          />
        )}

        {state.step === "tracking" && (
          <SettlementTracker
            timeline={timeline}
            status={state.orderStatus?.status ?? null}
            settlementRef={state.settlementRef}
            convertTxHash={state.convertTxHash}
            explorerUrl={explorerUrl}
            guestCheckout={state.guestCheckout}
            onNewConversion={reset}
          />
        )}
      </Card>
    </div>
  );
}
