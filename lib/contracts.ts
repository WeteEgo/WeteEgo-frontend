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
