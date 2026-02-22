# Monad Staking Template

A complete starter template for building and running a staking dApp on **Monad Testnet**.

This repo has two parts:
- `staking-contracts/`: Hardhat project (contracts + deploy scripts)
- `frontend /`: Next.js staking client UI

## What You Get

- Staking contract (`StakingRewards`) with:
  - staking / withdraw / claim
  - reward schedule controls (`setRewardsDuration`, `notifyRewardAmount`)
- ERC20 reward token contract (`RewardToken`)
- Deployment scripts for Monad Testnet
- Frontend dashboard wired for Monad staking interactions

## Network (Monad Testnet)

- Chain ID: `10143`
- RPC: `https://testnet-rpc.monad.xyz`
- Explorer: `https://testnet.monadvision.com`

## Prerequisites

- Node.js `20+`
- npm
- A funded Monad Testnet wallet

## Quick Start

### 1. Install contract dependencies

```bash
cd staking-contracts
npm install
```

### 2. Configure deployer wallet

Create `staking-contracts/.env`:

```env
PRIVATE_KEY=0xyour_private_key
```

### 3. Compile contracts

```bash
npx hardhat compile
```

### 4. Deploy reward token

```bash
npx hardhat run scripts/step-1-deploy-reward-token.ts --network monadTestnet
```

This writes `staking-contracts/reward-token-address.json`.

### 5. Configure staking deployment

Update `staking-contracts/scripts/deploy.ts`:
- `STAKING_TOKEN_ADDRESS`: token users will stake
- `REWARD_TOKEN_ADDRESS`: reward token address from step 4

### 6. Deploy staking contract

```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

This writes `staking-contracts/deployed-addresses.json`.

### 7. Initialize reward emissions (owner)

After deployment, owner should:
1. Transfer reward tokens to staking contract
2. Call `setRewardsDuration(uint256)`
3. Call `notifyRewardAmount(uint256)`

## Frontend Setup

### 1. Configure addresses

Open:
- `frontend /app/config/staking_config.ts`

Set:
- `STAKING_CONTRACT_ADDRESS`
- `STAKING_TOKEN_ADDRESS`
- `REWARD_TOKEN_ADDRESS`

### 2. Run frontend

```bash
cd "frontend "
npm install
npm run dev
```

Open the local URL printed by Next.js.

## Using the dApp

### User actions
- Connect wallet
- Switch to Monad Testnet
- Approve + Stake tokens
- Withdraw stake
- Claim rewards

### Owner actions
- Set reward duration
- Fund staking contract with reward token
- Notify reward amount

## Project Structure

```text
DogeClone/
  README.md
  staking-contracts/
    contracts/
      RewardToken.sol
      StakingContract.sol
    scripts/
      step-1-deploy-reward-token.ts
      deploy.ts
    hardhat.config.ts
  frontend /
    app/
      page.tsx
      config/
        chains.ts
        staking_config.ts
```

## Common Issues

- Hardhat compile import error (`HH411`):
  - Ensure contracts use `@openzeppelin/contracts` imports.
- Wrong wallet network:
  - Use Monad Testnet (`10143`).
- Frontend lint/build fails with old Node:
  - Upgrade to Node `20+`.

## Notes

- Current template is configured for Monad Testnet only.
- Keep contract addresses in frontend config in sync after every redeploy.
