# Monad Embedded Wallet Example

A clean starter template for building Monad Testnet apps with wallet UX and smart-contract interactions.

This template includes:
- Privy authentication with embedded EVM wallet
- Monad Testnet network configuration (Wagmi + Viem)
- Deposit and withdraw wallet modals
- On-chain counter integration (`getMyCount`, `totalCount`, `increaseCounter`)
- Next.js App Router + TypeScript + Tailwind setup

## Features

- Wallet authentication
- Embedded wallet support via Privy
- One-click network switch/add for Monad Testnet
- Counter contract hook (`useCounterContract`)
- Transaction confirmation flow with receipt waiting
- Responsive counter UI for desktop/mobile
- API route stubs ready for extension

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Wagmi + Viem
- Privy (`@privy-io/react-auth`, `@privy-io/wagmi`)

## Project Structure

- `src/app/page.tsx`: main counter app page
- `src/app/profile/page.tsx`: secondary counter utilities page
- `src/hooks/useMyContract.ts`: counter contract reads/writes
- `src/config/chains.ts`: Monad chain + contract address config
- `src/components/wallet/WalletActions.tsx`: balance, deposit, withdraw controls
- `src/components/wallet/AddFundsModal.tsx`: deposit/receive UI
- `src/components/wallet/WithdrawModal.tsx`: withdraw UI
- `src/lib/contract/abi.json`: counter contract ABI

## Prerequisites

- Node.js 20+
- npm
- Privy App ID
- Monad Testnet wallet/funds for testing

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Create local env file

```bash
touch .env.local
```

3. Add required environment variables

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_COUNTER_ADDRESS=0x65138ffa2eC30375776627bFF6318D3e792Bd0B9
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Notes:
- `NEXT_PUBLIC_COUNTER_ADDRESS` is optional if you want to keep the default contract already set in `src/config/chains.ts`.
- `NEXT_PUBLIC_SITE_URL` is used for app metadata URLs.

4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Counter Contract Integration

The template is wired to the following contract by default:

- Address: `0x65138ffa2eC30375776627bFF6318D3e792Bd0B9`
- Network: Monad Testnet (`chainId 10143`)

ABI location:
- `src/lib/contract/abi.json`

Hook usage:
- `useCounterContract()` exposes:
  - `myCount`
  - `totalCount`
  - `increaseCounter()`
  - `isPending`, `isLoading`, `actionError`

## Monad Network Config

Configured in `src/config/chains.ts`:
- RPC: `https://testnet-rpc.monad.xyz`
- Explorer: `https://testnet.monadvision.com`
- Symbol: `MON`

If a wallet is on another chain, the app attempts:
- `wallet_switchEthereumChain`
- fallback to `wallet_addEthereumChain`

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Build Notes

`npm run build` passes in this template. You may still see non-blocking warnings from transitive wallet dependencies (MetaMask SDK optional modules).

## Extending This Template

Common next steps for developers:
- Add event indexing for `CounterIncreased`
- Add a history table for user increments
- Add test coverage for hooks and UI actions
- Replace stub API routes with project-specific endpoints

## License

Use this template as a starter for hackathon and production prototypes.
