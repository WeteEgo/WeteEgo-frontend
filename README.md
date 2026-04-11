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

## Design system

The frontend uses a small Tailwind-based design system:

- `tailwind.config.ts` defines tokens for brand colors, surfaces, borders, shadows, and typography.
- `app/globals.css` sets the dark fintech background and layout helpers (`app-shell`, `app-main`, `app-container`).
- `components/ui/*` contains primitives:
  - `Button`, `Input`, `Select`, `Card`, `Alert`, `Stepper`.
- Screens (like `app/page.tsx`) compose these primitives into higher-level flows.

When adding new screens, prefer building with these primitives so typography, spacing, and states stay consistent.

## Docs at `/docs` (Vercel + Mintlify)

If you want **`yoursite.com/docs`** (or `*.vercel.app/docs`) while the app stays on Vercel:

1. In [Mintlify Custom domain](https://dashboard.mintlify.com/settings/deployment/custom-domain), add your domain and enable **Host at `/docs`** (see [Mintlify + Vercel](https://mintlify.com/docs/deploy/vercel)).
2. Copy your **Mintlify subdomain** from the dashboard URL (the segment after your org — **not** the `0xverse` value from Mintlify’s generic samples).
3. Edit **`vercel.json`** in this repo: replace `weteego` in `weteego.mintlify.dev` with that subdomain if yours differs.
4. Set **`NEXT_PUBLIC_DOCS_URL`** to your public docs base, e.g. `https://weteego.vercel.app/docs` or your production domain with `/docs`.

If docs use a **dedicated subdomain** only (e.g. **docs.weteego.com** → Mintlify via DNS), you do **not** need `vercel.json` rewrites; point **`NEXT_PUBLIC_DOCS_URL`** to `https://docs.weteego.com`.

## Env vars

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:3001`) — **required for Convert** |
| `NEXT_PUBLIC_CHAIN_ID` | `84532` (Base Sepolia) or `8453` (Base) |
| `NEXT_PUBLIC_GATEWAY_ADDRESS` or router | Deployed gateway/router address |
| `NEXT_PUBLIC_RPC_URL` | RPC URL for the chain |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID (optional) |
| `NEXT_PUBLIC_DOCS_URL` | Mintlify URL: dedicated subdomain and/or `/docs` on this deployment |

## "Failed to create order" / Convert not working

1. **Set backend URL** — In `.env.local` add `NEXT_PUBLIC_API_URL=http://localhost:3001` and restart `pnpm dev`.
2. **Backend running** — Start WeteEgo-backend: `cd WeteEgo-backend && pnpm dev` (must listen on 3001).
3. **DB + Redis** — Backend needs Postgres and Redis. From repo root: `docker-compose up -d postgres redis`.
4. **Quote expired** — If the 60s countdown hit zero, go back to step 1 (Amount), then step 2 (Bank), then Convert again so a fresh order is created.
5. **Check the red message** — The UI now shows the backend error (e.g. NUBAN invalid, guest limit, server error). Check the backend terminal for stack traces.

## License

MIT
