import type { BankAccount } from "@/components/BankAccountForm";
import type { QuoteResult } from "@/lib/rates";

export type FlowStep =
  | "connect"
  | "amount"
  | "bank"
  | "review"
  | "approve"
  | "convert"
  | "tracking";

export type TxLifecycleState = "idle" | "prompting" | "confirming" | "success" | "error";

export type OrderStatusValue =
  | "PENDING"
  | "FORWARDED"
  | "ESCROWED"
  | "EXPIRED"
  | "SETTLED"
  | "FAILED"
  | "REFUNDED";

export interface OrderStatus {
  id: string;
  settlementRef: string;
  status: OrderStatusValue;
  txHash?: string;
  guestCheckout?: boolean;
}

export interface FlowState {
  step: FlowStep;
  amount: string;
  fiatCurrency: string;
  bankAccount: BankAccount;
  quote: QuoteResult | null;
  settlementRef: `0x${string}` | null;
  orderId: string | null;
  orderStatus: OrderStatus | null;
  guestCheckout: boolean;
  convertTxHash: `0x${string}` | null;
}

export type FlowAction =
  | { type: "SET_STEP"; step: FlowStep }
  | { type: "SET_AMOUNT"; amount: string; fiatCurrency: string }
  | { type: "SET_BANK"; bankAccount: BankAccount }
  | { type: "SET_QUOTE"; quote: QuoteResult }
  | { type: "APPROVE_DONE" }
  | {
      type: "CONVERT_DONE";
      settlementRef: `0x${string}`;
      orderId: string;
      txHash: `0x${string}`;
      guestCheckout: boolean;
    }
  | { type: "ORDER_UPDATE"; status: OrderStatus }
  | { type: "GO_BACK" }
  | { type: "RESET" };

export const STEP_ORDER: readonly FlowStep[] = [
  "connect",
  "amount",
  "bank",
  "review",
  "approve",
  "convert",
  "tracking",
] as const;

export function previousStep(step: FlowStep): FlowStep | null {
  const idx = STEP_ORDER.indexOf(step);
  return idx > 0 ? STEP_ORDER[idx - 1] : null;
}
