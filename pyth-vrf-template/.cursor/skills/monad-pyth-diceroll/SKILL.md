---
name: monad-pyth-diceroll
description: Build, deploy, and integrate the Pyth Entropy dice app on Monad testnet across both Hardhat contracts and the ui-diceroll frontend. Use when working on VRF dice logic, roll scripts, contract addresses/ABI wiring, Wagmi integration, transaction polling, roll history, or wallet/network UX in this repository.
---

# Monad Pyth Dice Roll

## Scope

Use this skill for end-to-end work in this repo:
- Solidity contract changes in `contracts/VRFPyth.sol`
- Hardhat scripts/tests/deploy in `scripts/`, `test/`, and config files
- Frontend integration in `ui-diceroll/` using Wagmi + ConnectKit

## Repo Map

- Contract: `contracts/VRFPyth.sol` (`PythRandomDice`)
- Hardhat watcher script: `scripts/roll-and-check.ts`
- Deployed address source: `deployed-addresses.json`
- Frontend contract config: `ui-diceroll/config/contract.ts`
- Frontend app: `ui-diceroll/app/page.tsx`, `ui-diceroll/app/providers.tsx`

## Core Rules

1. Keep network fixed to Monad testnet unless user asks otherwise.
2. Prefer reading fee dynamically from entropy (`getFeeV2`) before calling `rollDice`.
3. In UI, do not stop dice animation until `DiceRolled` event is received.
4. When event is received, verify player matches connected wallet before applying result.
5. Keep local roll history persistent (`localStorage`) and include tx hash + latency.

## Hardhat Workflow

1. Install deps and compile:
   - `pnpm install`
   - `pnpm hardhat compile`
2. Deploy `PythRandomDice` with Monad entropy address.
3. Save deployed address consistently (update `deployed-addresses.json` and frontend config if needed).
4. Validate with script flow:
   - Run `scripts/roll-and-check.ts` on Monad testnet.
   - Confirm tx is sent and `DiceRolled` event arrives.
5. If contract ABI changes, regenerate/update frontend ABI in `ui-diceroll/config/contract.ts`.

## Frontend Integration Workflow

1. Chain/provider:
   - Define Monad testnet chain in `ui-diceroll/app/providers.tsx`.
   - Configure Wagmi + ConnectKit provider stack.
2. Contract wiring:
   - Import `ABI`, `ContractAddressDice`, `MonadEntropyAddress` from `ui-diceroll/config/contract.ts`.
   - Use `useReadContract` for entropy fee and `useWriteContract` for `rollDice`.
3. Roll lifecycle UX:
   - Start rolling animation immediately on roll action.
   - Show transaction states: sending, confirming, waiting callback.
   - Watch `DiceRolled` event and stop rolling only when result for current wallet arrives.
4. Wallet/navbar UX:
   - Show short address, network, MON balance, and switch-network action.
   - Keep Monad testnet as required chain.
5. History:
   - Store entries in `localStorage` with:
     - `result`, `address`, `timestamp`, `txHash`, `resolveSeconds`
   - Render history in sidebar table with explorer link.

## Validation Checklist

- Contract compiles with no errors.
- `roll-and-check` script successfully receives callback.
- Frontend roll sends payable tx with entropy fee.
- Dice spins continuously until contract result event.
- Waiting timer appears during pending flow and stops on result.
- History row is added with valid explorer tx link.
- Connected wallet balance and network are visible.

## Common Fixes

- **No balance shown**: ensure `ConnectKitButton` uses `showBalance` and Wagmi `useBalance` is chain-aware.
- **Wrong network**: show `Switch to Monad Testnet` action and block roll on unsupported chain.
- **No callback seen**: verify entropy fee, contract address, ABI event shape, and wallet address match logic.
- **Turbopack/webpack error**: keep `next.config.ts` compatible with Next 16 (`turbopack` + webpack fallback config).
