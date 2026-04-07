interface MappedError {
  message: string;
  action?: "retry" | "get-eth" | "reduce-amount" | "contact-support";
}

export function mapContractError(error: Error | null): MappedError {
  if (!error) return { message: "Something went wrong. Please try again.", action: "retry" };

  const msg = error.message.toLowerCase();

  if (msg.includes("user rejected") || msg.includes("user denied")) {
    return { message: "Transaction cancelled. You can try again when ready." };
  }
  if (msg.includes("insufficient funds for gas") || msg.includes("insufficient funds")) {
    return { message: "Not enough ETH to cover gas fees.", action: "get-eth" };
  }
  if (msg.includes("exceeds max transaction gas") || msg.includes("gas limit")) {
    return { message: "Transaction too large. Try a smaller amount.", action: "reduce-amount" };
  }
  if (msg.includes("exceeds balance") || msg.includes("transfer amount exceeds balance")) {
    return { message: "You don't have enough USDC for this amount.", action: "reduce-amount" };
  }
  if (msg.includes("allowance") || msg.includes("exceeds allowance")) {
    return { message: "USDC approval needed before converting. Please approve first." };
  }
  if (msg.includes("expired") || msg.includes("order expired")) {
    return { message: "This order has expired. Please start a new conversion.", action: "retry" };
  }
  if (msg.includes("nonce")) {
    return { message: "Transaction conflict. Please wait a moment and try again.", action: "retry" };
  }
  if (msg.includes("network") || msg.includes("timeout") || msg.includes("disconnected")) {
    return { message: "Network issue. Check your connection and try again.", action: "retry" };
  }

  return { message: "Something went wrong. Please try again.", action: "retry" };
}

export function mapBackendError(error: string): string {
  if (error.includes("KYC") || error.includes("kyc")) {
    return "Orders over $500 require identity verification.";
  }
  if (error.includes("Backend URL not set")) {
    return "Service temporarily unavailable. Please try again later.";
  }
  if (error.includes("Network error")) {
    return "Could not reach the server. Please check your connection.";
  }
  return error;
}
