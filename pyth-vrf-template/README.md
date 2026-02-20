# Pyth VRF on Monad (Working Template)

This template contains a fully working developer setup for Pyth Entropy (VRF-style randomness) on Monad Testnet.

It includes:
- `contracts/VRFPyth.sol`: `PythRandomDice` contract implementing `IEntropyConsumer`
- `scripts/deploy.ts`: deploy script for Monad Testnet
- `scripts/roll-and-check.ts`: script to request randomness and wait for callback result

## Contract Flow

1. User calls `rollDice()` and pays the Entropy fee.
2. Contract requests randomness via `entropy.requestV2`.
3. Pyth Entropy calls back `entropyCallback`.
4. Contract emits `DiceRolled(player, result)` where `result` is between `1` and `6`.

## Network Configuration

Monad Testnet is preconfigured in `hardhat.config.ts`:
- Network name: `monadTestnet`
- Chain ID: `10143`
- RPC: `https://testnet-rpc.monad.xyz`

Entropy addresses are defined in `constants/index.ts`:
- Monad Testnet Entropy: `0x825c0390f379c631f3cf11a82a37d20bddf93c07`
- Monad Mainnet Entropy: `0xd458261e832415cfd3bae5e416fdf3230ce6f134`

## Setup

```bash
pnpm install
```

Create `.env` in this folder:

```env
PRIVATE_KEY=0xyour_wallet_private_key
```

Use a funded Monad Testnet wallet for deployment and randomness request fees.

## Deploy

```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

On success, deployment details are saved to:
- `deployed-addresses.json`

## Request Randomness (End-to-End Check)

```bash
npx hardhat run scripts/roll-and-check.ts --network monadTestnet
```

Expected behavior:
- Script prints signer and current Entropy fee
- Sends `rollDice()` transaction
- Waits for callback event
- Prints `DiceRolled` result

If callback is delayed, the script times out after 3 minutes.

## Notes for Devs

- This template is ready for local development and Monad Testnet execution.
- `deployed-addresses.json` must exist before running `roll-and-check.ts`.
- If you change the contract name, keep `scripts/deploy.ts` and script references in sync.
