"use client";

import { useReducer, useCallback } from "react";
import type { FlowState, FlowAction, FlowStep } from "@/lib/flow-types";

const INITIAL_STATE: FlowState = {
  step: "connect",
  amount: "",
  fiatCurrency: "NGN",
  bankAccount: { accountNumber: "", bankCode: "GTBINGLA", accountName: "" },
  quote: null,
  settlementRef: null,
  orderId: null,
  orderStatus: null,
  guestCheckout: false,
  convertTxHash: null,
};

const BACK_MAP: Partial<Record<FlowStep, FlowStep>> = {
  amount: "connect",
  bank: "amount",
  review: "bank",
  approve: "review",
  convert: "review",
};

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };

    case "SET_AMOUNT":
      return { ...state, amount: action.amount, fiatCurrency: action.fiatCurrency };

    case "SET_BANK":
      return { ...state, bankAccount: action.bankAccount };

    case "SET_QUOTE":
      return { ...state, quote: action.quote };

    case "APPROVE_DONE":
      return { ...state, step: "convert" };

    case "CONVERT_DONE":
      return {
        ...state,
        step: "tracking",
        settlementRef: action.settlementRef,
        orderId: action.orderId,
        convertTxHash: action.txHash,
        guestCheckout: action.guestCheckout,
      };

    case "ORDER_UPDATE":
      return { ...state, orderStatus: action.status };

    case "GO_BACK": {
      const prev = BACK_MAP[state.step];
      return prev ? { ...state, step: prev } : state;
    }

    case "RESET":
      return { ...INITIAL_STATE, step: "amount" };

    default:
      return state;
  }
}

export function useConvertFlow(isConnected: boolean) {
  const [state, dispatch] = useReducer(flowReducer, {
    ...INITIAL_STATE,
    step: isConnected ? "amount" : "connect",
  });

  const goTo = useCallback((step: FlowStep) => dispatch({ type: "SET_STEP", step }), []);
  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return { state, dispatch, goTo, goBack, reset };
}
