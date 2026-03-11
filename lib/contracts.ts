/** ERC20 approve + allowance read */
export const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * WeteEgoRouter ABI (minimal: forwardERC20 + SwapForwarded).
 * Full ABI from WeteEgo-Contracts out/ after forge build.
 */
export const WETEEGO_ROUTER_ABI = [
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "settlementRef", type: "bytes32" },
    ],
    name: "forwardERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: true, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "settlementRef", type: "bytes32" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "SwapForwarded",
    type: "event",
  },
] as const;

/** USDC on Base Sepolia */
export const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
/** USDC on Base mainnet */
export const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

/**
 * WeteEgoGateway ABI (Phase 1 escrow contract).
 * createOrder: pulls USDC from sender, holds in escrow, emits OrderCreated.
 */
export const WETEEGO_GATEWAY_ABI = [
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "orderId", type: "bytes32" },
      { name: "settlementRef", type: "bytes32" },
    ],
    name: "createOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "orderId", type: "bytes32" },
      { indexed: true, name: "sender", type: "address" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "settlementRef", type: "bytes32" },
      { indexed: false, name: "expiresAt", type: "uint256" },
    ],
    name: "OrderCreated",
    type: "event",
  },
] as const;

/** WeteEgoGateway on Base Sepolia */
export const GATEWAY_BASE_SEPOLIA = "0xbe710276c4114c3846a209191a8800049b8ad0a6" as const;
/** WeteEgoGateway on Base mainnet (not yet deployed) */
export const GATEWAY_BASE = "" as const;
