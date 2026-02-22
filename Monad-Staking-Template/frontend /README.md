# Monad Staking Frontend

Next.js frontend for the Monad Testnet staking demo client.

## Network
- Chain: Monad Testnet
- Chain ID: `10143`
- RPC: `https://testnet-rpc.monad.xyz`
- Explorer: `https://testnet.monadvision.com`

## Integrated Contracts
- Staking Contract: `0x05e5Fd41B82A368f5E3c158200996a9E42deF869`
- Staking Token: `0x534b2f3A21130d7a60830c2Df862319e593943A3`
- Reward Token: `0x40D419F6aE98cF4726825f59718dc2cDB4F43bf5`

## Features
- Wallet connect
- Monad network switch/add in wallet
- Read staking state (`owner`, `duration`, `finishAt`, `rewardRate`, `totalSupply`)
- User actions: approve+stake, withdraw, claim rewards
- Owner actions: set duration, fund rewards, notify reward amount

## Run
```bash
npm install
npm run dev
```

## Main Files
- `app/page.tsx`: staking dashboard UI + contract interactions
- `app/config/chains.ts`: Monad network config
- `app/config/staking_config.ts`: contract addresses + ABI
- `app/components/Navigation.tsx`: top navigation and contract explorer link
