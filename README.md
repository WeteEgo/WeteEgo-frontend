# WeteEgo-frontend

Main dApp for stablecoin-to-fiat on Base. Users connect a wallet, enter USDC amount and target fiat (e.g. NGN), approve USDC, and convert — funds are forwarded to the **Paycrest** gateway via WeteEgoRouter for settlement.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- wagmi v2, viem, WalletConnect
- Base + Base Sepolia

## Setup

```bash
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_ROUTER_ADDRESS (from WeteEgo-Contracts deploy),
# NEXT_PUBLIC_CHAIN_ID (84532 or 8453), NEXT_PUBLIC_RPC_URL, and optionally
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (https://cloud.walletconnect.com).
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flow

1. Connect wallet (injected or WalletConnect); switch to Base Sepolia or Base if needed.
2. Enter amount (USDC) and target fiat currency.
3. Click **Approve USDC** (if allowance &lt; amount).
4. Click **Convert** — calls `WeteEgoRouter.forwardERC20(USDC, amount, ref)`; router forwards to Paycrest settlement address.
5. View tx status and link to Basescan.

## Env vars

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CHAIN_ID` | `84532` (Base Sepolia) or `8453` (Base) |
| `NEXT_PUBLIC_ROUTER_ADDRESS` | Deployed WeteEgoRouter address |
| `NEXT_PUBLIC_RPC_URL` | RPC URL for the chain |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID (optional) |

## License

MIT
