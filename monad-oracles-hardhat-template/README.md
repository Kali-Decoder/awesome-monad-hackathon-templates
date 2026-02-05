# Monad Oracle Template

A comprehensive Hardhat template for integrating all oracles supported by Monad blockchain. This template provides ready-to-use contracts and scripts for deploying and interacting with multiple oracle providers.

## Table of Contents

- [Supported Oracles](#supported-oracles)
- [Prerequisites](#prerequisites)
- [Setup Guide](#setup-guide)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Install Dependencies](#step-2-install-dependencies)
  - [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
  - [Step 4: Verify `.gitignore`](#step-4-verify-gitignore)
  - [Step 5: Configure Network Settings](#step-5-configure-network-settings)
  - [Step 6: Compile Contracts](#step-6-compile-contracts)
  - [Step 7: Get Testnet Tokens](#step-7-get-testnet-tokens)
- [Quick Start Guide](#quick-start-guide)
- [Configuration](#configuration)
- [How to Use This Template](#how-to-use-this-template)
- [Common Workflows](#common-workflows)
- [Usage](#usage)
  - [Pyth Oracle](#1-pyth-oracle)
  - [Chronicle Oracle](#2-chronicle-oracle)
  - [Redstone Oracle](#3-redstone-oracle)
  - [Stork Oracle](#4-stork-oracle)
  - [Switchboard Oracle](#5-switchboard-oracle)
- [Contract Structure](#contract-structure)
- [Scripts Structure](#scripts-structure)
- [Price Feed Decimals](#price-feed-decimals)
- [Post-Setup Checklist](#post-setup-checklist)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Resources](#resources)

## Supported Oracles

This template includes implementations for the following oracle providers:

1. **Pyth Network** - Decentralized price feeds
2. **Chronicle** - Decentralized oracle protocol
3. **Redstone** - Modular oracle protocol
4. **Stork Oracle** - Chainlink and Pyth adapters
5. **Switchboard** - On-demand oracle network

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)
- A crypto wallet (MetaMask, etc.) with Monad testnet tokens

### Verify Installation

Check your Node.js and npm versions:
```bash
node --version  # Should be v16 or higher
npm --version   # Should be v6 or higher
```

## Setup Guide

### Step 1: Clone the Repository

Clone this repository to your local machine:

```bash
git clone <repository-url>
cd Monad-All_Oracles-main
```

If you downloaded a ZIP file, extract it and navigate to the directory:
```bash
cd Monad-All_Oracles-main
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:
- Hardhat and Hardhat Toolbox
- Oracle SDKs (Pyth, Redstone, Stork, Switchboard)
- TypeScript and other development dependencies

**Expected output**: You should see packages being installed. The process may take 1-2 minutes.

### Step 3: Configure Environment Variables

Create a `.env` or `.env.local` file in the root directory. You can copy the example file:

```bash
cp .env.example .env.local
```

Or create it manually:

**On Linux/Mac:**
```bash
touch .env.local
```

**On Windows:**
```bash
type nul > .env.local
```

Add your private key to the `.env.local` file:

```env
DEPLOYER_ACCOUNT_PRIV_KEY=your_private_key_without_0x_prefix
```

**Example:**
```env
DEPLOYER_ACCOUNT_PRIV_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**⚠️ Security Warning**: 
- Never commit your `.env` or `.env.local` file to version control
- Never share your private key
- Use a dedicated testnet wallet, never use your Monad mainnet wallet
- The private key should NOT include the `0x` prefix
- The `.env.example` file is safe to commit (it contains no real values)

### Step 4: Verify `.gitignore`

The `.gitignore` file should already include `.env` and `.env.local`. Verify it exists and contains:

```
.env
.env.local
node_modules/
```

This ensures your private keys are never committed to version control.

### Step 5: Configure Network Settings

Open `hardhat.config.ts` and verify/update the network configuration:

```typescript
monadTestnet: {
  chainId: 10143,
  url: "https://monad-testnet.g.alchemy.com/v2/YOUR_API_KEY",
  accounts: ACCOUNTS,
}
```

**RPC Options:**
- Use the default Alchemy RPC (requires API key from [Alchemy](https://www.alchemy.com/))
- Use a public RPC endpoint (if available)
- Use other Monad RPC providers

**Example with public RPC (if available):**
```typescript
monadTestnet: {
  chainId: 10143,
  url: "https://monad-testnet-rpc.publicnode.com", // Example public RPC
  accounts: ACCOUNTS,
}
```

### Step 6: Compile Contracts

Verify everything is set up correctly by compiling the contracts:

```bash
npx hardhat compile
```

**Expected output**: You should see compilation successful messages. If there are errors, check your Node.js version and try `npm install` again.

### Step 7: Get Testnet Tokens

Before deploying, you'll need Monad testnet tokens:

1. Add Monad Testnet to your MetaMask:
   - Network Name: Monad Testnet
   - RPC URL: `https://monad-testnet-rpc.publicnode.com` (or your configured RPC)
   - Chain ID: `10143`
   - Currency Symbol: `MON`

2. Get testnet tokens from the Monad faucet (check Monad documentation for current faucet URL)

## Quick Start Guide

### First-Time Usage

1. **Choose an Oracle**: Decide which oracle you want to use (Pyth is recommended for beginners)

2. **Update Script Configuration**: 
   - Open the deployment script for your chosen oracle (e.g., `scripts/pyth/deploy.pythoracle.ts`)
   - Update the oracle-specific addresses/IDs with Monad testnet values

3. **Deploy Your First Contract**:
   ```bash
   npx hardhat run scripts/pyth/deploy.pythoracle.ts --network monadTestnet
   ```

4. **Save the Deployed Address**: Copy the deployed contract address from the output

5. **Read Price Data**:
   - Update the read script with your deployed contract address
   - Run the read script:
   ```bash
   npx hardhat run scripts/pyth/pyth.read.ts --network monadTestnet
   ```

### Example: Complete Pyth Oracle Setup

Here's a complete walkthrough for setting up Pyth Oracle:

1. **Find Pyth Contract Address on Monad**:
   - Check Pyth documentation for Monad testnet addresses
   - Or check deployed contracts on Monad explorer

2. **Edit `scripts/pyth/deploy.pythoracle.ts`**:
   ```typescript
   const PYTH_ADDRESS = "0x7cE7845bDE4277e8Aa132aC4c042605e7d42B71C"; // Update with actual address
   ```

3. **Deploy**:
   ```bash
   npx hardhat run scripts/pyth/deploy.pythoracle.ts --network monadTestnet
   ```
   
   **Output example:**
   ```
   Deploying...
   Deployed Pyth Contract Address: 0x1234567890123456789012345678901234567890
   ```

4. **Edit `scripts/pyth/pyth.read.ts`**:
   ```typescript
   const PythAddress = "0x1234567890123456789012345678901234567890"; // Your deployed address
   const pythId = "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f"; // ETH/USD feed
   ```

5. **Read Price**:
   ```bash
   npx hardhat run scripts/pyth/pyth.read.ts --network monadTestnet
   ```

## Configuration

### Network Configuration

The project is pre-configured for Monad Testnet. You can modify network settings in `hardhat.config.ts`:

**Available Networks:**
- `hardhat` - Local Hardhat network (for local testing)
- `monadTestnet` - Monad Testnet (Chain ID: 10143)

**Monad Testnet Configuration:**

The default configuration in `hardhat.config.ts`:

```typescript
networks: {
  hardhat: { chainId: 31337 },
  monadTestnet: {
    chainId: 10143,
    url: "https://monad-testnet.g.alchemy.com/v2/YOUR_API_KEY",
    accounts: ACCOUNTS,
  },
}
```

**Updating RPC URL:**

If you need to use a different RPC endpoint for Monad Testnet, update the `url` in `hardhat.config.ts`:

```typescript
monadTestnet: {
  chainId: 10143,
  url: "YOUR_MONAD_RPC_URL", // Update with your preferred RPC endpoint
  accounts: ACCOUNTS,
}
```

### Solidity Configuration

The project uses Solidity `0.8.28` with Paris EVM version. You can modify this in `hardhat.config.ts`:

```typescript
solidity: {
  version: "0.8.28",
  settings: {
    evmVersion: "paris",
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
}
```

### Oracle-Specific Configuration

Each oracle requires specific configuration:

- **Pyth**: Requires Pyth contract address on the network
- **Chronicle**: Uses pre-deployed contracts (addresses in contract)
- **Redstone**: Requires adapter address and data feed ID
- **Stork**: Requires adapter address and asset ID
- **Switchboard**: Requires Switchboard contract address and aggregator ID

See individual oracle sections below for detailed configuration.

## How to Use This Template

This template is designed to be a starting point for your oracle integrations. Here's how to use it effectively:

### Using as a Reference

1. **Copy Contracts**: Copy the oracle contracts you need into your own project
2. **Adapt Scripts**: Modify the deployment and read scripts for your use case
3. **Integrate**: Import oracle contracts into your own smart contracts

### Customizing for Your Project

#### Step 1: Choose Your Oracle(s)

Review the available oracles and select the ones that fit your needs:
- **Pyth**: Best for high-frequency price updates
- **Chronicle**: Good for stable, reliable feeds
- **Redstone**: Modular, flexible oracle solution
- **Stork**: Chainlink-compatible adapter
- **Switchboard**: On-demand oracle updates

#### Step 2: Modify Scripts

Each oracle has deployment and read scripts. Customize them:

**Example - Customizing Pyth Deployment:**

```typescript
// scripts/pyth/deploy.pythoracle.ts
import { ethers } from "hardhat";

async function deployPythContract() {
  const CONTRACT_NAME = "Oracle_Pyth";
  
  // Update with your network's Pyth address
  const PYTH_ADDRESS = "0x7cE7845bDE4277e8Aa132aC4c042605e7d42B71C";
  
  console.log("Deploying...");
  const pyth = await ethers.deployContract(CONTRACT_NAME, [PYTH_ADDRESS]);
  await pyth.waitForDeployment();
  
  const address = await pyth.getAddress();
  console.log("Deployed Pyth Contract Address:", address);
  
  // Save address for later use
  return address;
}

async function main() {
  const deployedAddress = await deployPythContract();
  // You can add additional logic here, like verifying the contract
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

#### Step 3: Integrate into Your Contracts

Import and use oracle contracts in your own smart contracts:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./contracts/pyth/PythOracle.sol";

contract MyDApp {
    Oracle_Pyth public pythOracle;
    
    constructor(address _pythOracle) {
        pythOracle = Oracle_Pyth(_pythOracle);
    }
    
    function getPrice(bytes32 priceId) public view returns (uint256) {
        return pythOracle.read(priceId);
    }
    
    // Your dApp logic here
}
```

#### Step 4: Create Your Own Deployment Scripts

Create custom deployment scripts that deploy multiple contracts:

```typescript
// scripts/deploy-all.ts
import { ethers } from "hardhat";

async function main() {
  // Deploy Pyth Oracle
  const pyth = await ethers.deployContract("Oracle_Pyth", [PYTH_ADDRESS]);
  await pyth.waitForDeployment();
  console.log("Pyth deployed to:", await pyth.getAddress());
  
  // Deploy your dApp contract
  const myDApp = await ethers.deployContract("MyDApp", [await pyth.getAddress()]);
  await myDApp.waitForDeployment();
  console.log("MyDApp deployed to:", await myDApp.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

### Testing Your Integration

1. **Local Testing**: Use Hardhat's local network:
   ```bash
   npx hardhat node
   # In another terminal
   npx hardhat run scripts/pyth/deploy.pythoracle.ts --network localhost
   ```

2. **Testnet Testing**: Deploy to Monad testnet:
   ```bash
   npx hardhat run scripts/pyth/deploy.pythoracle.ts --network monadTestnet
   ```

3. **Verify Contracts**: After deployment, verify on explorer:
   ```bash
   npx hardhat verify --network monadTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
   ```

### Best Practices

1. **Error Handling**: Always add error handling in your contracts
2. **Price Validation**: Check price staleness and validity
3. **Gas Optimization**: Consider gas costs when reading prices
4. **Multiple Oracles**: Consider using multiple oracles for critical price feeds
5. **Testing**: Thoroughly test on Monad testnet before deploying to Monad mainnet (when available)

## Common Workflows

### Workflow 1: Quick Test - Deploy and Read Price

This is the fastest way to test an oracle:

1. **Deploy**:
   ```bash
   npx hardhat run scripts/pyth/deploy.pythoracle.ts --network monadTestnet
   ```

2. **Copy the deployed address** from output

3. **Update read script** with the address

4. **Read price**:
   ```bash
   npx hardhat run scripts/pyth/pyth.read.ts --network monadTestnet
   ```

### Workflow 2: Integrate Oracle into Your dApp

1. **Deploy oracle wrapper** (if needed)

2. **Create your contract** that uses the oracle:
   ```solidity
   import "./contracts/pyth/PythOracle.sol";
   
   contract MyDApp {
       Oracle_Pyth public oracle;
       // Your contract logic
   }
   ```

3. **Deploy your contract** with oracle address as constructor parameter

4. **Test locally** first, then deploy to testnet

### Workflow 3: Use Multiple Oracles

For redundancy, you can use multiple oracles:

```solidity
contract MultiOraclePriceFeed {
    Oracle_Pyth public pythOracle;
    PriceFeedBase public redstoneOracle;
    
    function getPrice() public view returns (uint256) {
        uint256 pythPrice = pythOracle.read(ETH_FEED_ID);
        // Compare with Redstone price
        // Return average or use other logic
    }
}
```

### Workflow 4: Custom Oracle Reader

Create your own reader contract:

```solidity
contract CustomOracleReader {
    Oracle_Pyth public pyth;
    
    constructor(address _pyth) {
        pyth = Oracle_Pyth(_pyth);
    }
    
    function getMultiplePrices(bytes32[] memory feedIds) 
        public 
        view 
        returns (uint256[] memory prices) 
    {
        prices = new uint256[](feedIds.length);
        for (uint i = 0; i < feedIds.length; i++) {
            prices[i] = pyth.read(feedIds[i]);
        }
    }
}
```

## Usage

### 1. Pyth Oracle

Pyth Network provides high-frequency price feeds for various assets. The template includes a wrapper contract that normalizes prices to 18 decimals.

#### Step-by-Step: Deploy Pyth Oracle Contract

1. **Find Pyth Contract Address on Monad**:
   - Check [Pyth Network Documentation](https://docs.pyth.network/) for Monad testnet addresses
   - Or check the Monad explorer for deployed Pyth contracts
   - Example testnet address: `0x7cE7845bDE4277e8Aa132aC4c042605e7d42B71C`

2. **Edit Deployment Script**:
   
   Open `scripts/pyth/deploy.pythoracle.ts` and update:
   ```typescript
   const PYTH_ADDRESS = "0x7cE7845bDE4277e8Aa132aC4c042605e7d42B71C"; // Update this
   ```

3. **Deploy the Contract**:
   ```bash
   npx hardhat run scripts/pyth/deploy.pythoracle.ts --network monadTestnet
   ```

4. **Save the Deployed Address**:
   
   Copy the output address. You'll need it for reading prices and integrating into your contracts.

#### Step-by-Step: Read Price from Pyth Oracle

1. **Find Price Feed ID**:
   
   Visit [Pyth Network Price Feeds](https://pyth.network/developers/price-feed-ids) to find the feed ID for your asset.
   
   Common feed IDs:
   - ETH/USD: `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`
   - BTC/USD: `0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43`
   - USDC/USD: `0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a`

2. **Edit Read Script**:
   
   Open `scripts/pyth/pyth.read.ts` and update:
   ```typescript
   const PythAddress = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS"; // Your deployed contract
   const pythId = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"; // ETH/USD
   ```

3. **Read the Price**:
   ```bash
   npx hardhat run scripts/pyth/pyth.read.ts --network monadTestnet
   ```

4. **Interpret the Result**:
   
   The output shows the price in 18 decimals. To convert to USD:
   ```javascript
   const priceInUSD = ethers.formatUnits(price, 18);
   console.log("Price:", priceInUSD, "USD");
   ```

#### Integrating Pyth Oracle in Your Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./contracts/pyth/PythOracle.sol";

contract MyContract {
    Oracle_Pyth public pythOracle;
    bytes32 public constant ETH_USD_FEED_ID = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;
    
    constructor(address _pythOracle) {
        pythOracle = Oracle_Pyth(_pythOracle);
    }
    
    function getETHPrice() public view returns (uint256) {
        return pythOracle.read(ETH_USD_FEED_ID);
    }
    
    function getPriceInUSD(bytes32 feedId) public view returns (uint256) {
        uint256 price = pythOracle.read(feedId);
        // Price is already in 18 decimals
        return price;
    }
}
```

**Key Points**:
- Prices are normalized to 18 decimals
- Use `read(bytes32 priceFeedId)` to get the latest price
- Prices are updated frequently by Pyth network

### 2. Chronicle Oracle

#### Deploy Chronicle Oracle Reader

The Chronicle oracle uses pre-deployed contracts on Monad. You can deploy a reader contract:

```bash
npx hardhat run scripts/chronicle/deploy.chronicleoracle.ts --network monadTestnet
```

**Available Chronicle Feeds on Monad**:
- CBBTC_USD: `0xcB0ABe397952844C379A29343cDb17c914F33e40`
- ETH_USD: `0xC32753217DcC7Bb2F449bD6f1bC384d1AC72a7B6`
- PUMPBTC_USD: `0x9ee0DC1f7cF1a5c083914e3de197Fd1F484E0578`
- SOLVBTC_USD: `0xC991e18E3f167F7457e06B780e92EA94a6b3c1bb`
- USDC_USD: `0xd800ca44fFABecd159c7889c3bf64a217361AEc8`
- USDT_USD: `0x09672B2a62Db1cd4cCE379bdde5BF41931177A72`
- WBTC_USD: `0x8f01f70bE5DeEA5D4273D9a299A1A609BF1649c0`

**Example Contract Usage**:
```solidity
import "./contracts/chronicle/ChroncleOracle.sol";

OracleReader chronicleReader = OracleReader(chronicleAddress);
(uint256 value, uint256 age) = chronicleReader.read(1); // 1 = CBBTC_USD, 2 = ETH_USD, etc.
```

### 3. Redstone Oracle

#### Deploy Redstone Price Feed

Redstone uses a base contract that needs to be extended. Deploy your custom price feed:

```bash
npx hardhat run scripts/redstone/deploy.redstone.ts --network monadTestnet
```

#### Read Price from Redstone Oracle

```bash
npx hardhat run scripts/redstone/getPriceFeed.ts --network monadTestnet
```

**Configuration**: Update `PRICE_FEED_ADDRESS` with your deployed Redstone price feed address.

**Example Contract Usage**:
```solidity
import "./contracts/redstone/PriceFeedBase.sol";

PriceFeedBase redstoneFeed = PriceFeedBase(priceFeedAddress);
(uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) = 
    redstoneFeed.latestRoundData();
// Price is in 8 decimals
uint256 price = uint256(answer);
```

### 4. Stork Oracle

#### Deploy Stork Chainlink Adapter

```bash
npx hardhat run scripts/storkoracle/deploy.storkchainlink.ts --network monadTestnet
```

**Configuration**: 
- Update `storkChainlinkAdapterAddress` with the Stork adapter address
- Update `assetId` with the asset ID you want to query (e.g., ETH/USD)

#### Deploy Stork Pyth Adapter

```bash
npx hardhat run scripts/storkoracle/deploy.storkpyth.ts --network monadTestnet
```

#### Read Price from Stork Oracle

```bash
npx hardhat run scripts/storkoracle/getData.stork.ts --network monadTestnet
```

**Configuration**: Update `storkChainlinkAdapterAddress` with your deployed adapter address.

**Example Contract Usage**:
```solidity
import "./contracts/storkoracle/StorkChainlinkOracle.sol";

TestStorkChainlinkAdapter storkAdapter = TestStorkChainlinkAdapter(adapterAddress);
(uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) = 
    storkAdapter.latestRoundData();
```

### 5. Switchboard Oracle

#### Deploy Switchboard Oracle Reader

```bash
npx hardhat run scripts/switchboard/deploy.switchboard_oracle.ts --network monadTestnet
```

**Configuration**:
- Update `_switchboard` with the Switchboard contract address on Monad
- Update `_aggregatorId` with the aggregator ID for your price feed

#### Read Price from Switchboard Oracle

```bash
npx hardhat run scripts/switchboard/getPriceFeed.ts --network monadTestnet
```

**Configuration**: Update `PRICE_FEED_ADDRESS` with your deployed Switchboard reader address.

**Example Contract Usage**:
```solidity
import "./contracts/switchboard/Switchboard.sol";

SwitchboardOracleReader switchboardReader = SwitchboardOracleReader(readerAddress);
// Note: Switchboard requires updates to be submitted with getFeedData()
// The result is stored in the contract's result variable
int128 price = switchboardReader.result(); // Price in 18 decimals
```

## Contract Structure

```
contracts/
├── chronicle/
│   └── ChroncleOracle.sol          # Chronicle oracle reader
├── pyth/
│   └── PythOracle.sol              # Pyth oracle wrapper
├── redstone/
│   ├── core/                       # Redstone core contracts
│   ├── interfaces/                 # Redstone interfaces
│   └── PriceFeedBase.sol           # Base price feed contract
├── storkoracle/
│   ├── StorkChainlinkOracle.sol    # Stork Chainlink adapter
│   └── StorkPythOracle.sol         # Stork Pyth adapter
└── switchboard/
    └── Switchboard.sol             # Switchboard oracle reader
```

## Scripts Structure

```
scripts/
├── chronicle/
│   └── deploy.chronicleoracle.ts   # Deploy Chronicle reader
├── pyth/
│   ├── deploy.pythoracle.ts        # Deploy Pyth oracle
│   └── pyth.read.ts                # Read Pyth prices
├── redstone/
│   └── getPriceFeed.ts             # Read Redstone prices
├── storkoracle/
│   ├── deploy.storkchainlink.ts    # Deploy Stork Chainlink adapter
│   ├── deploy.storkpyth.ts         # Deploy Stork Pyth adapter
│   └── getData.stork.ts            # Read Stork prices
└── switchboard/
    ├── deploy.switchboard_oracle.ts # Deploy Switchboard reader
    └── getPriceFeed.ts              # Read Switchboard prices
```

## Price Feed Decimals

Different oracles use different decimal precisions:

- **Pyth**: 18 decimals (normalized in the wrapper contract)
- **Chronicle**: Varies by feed
- **Redstone**: 8 decimals
- **Stork**: Varies by adapter (typically 8 decimals)
- **Switchboard**: 18 decimals

Always check the contract documentation or source code for the exact decimal precision.

## Compiling Contracts

```bash
npx hardhat compile
```

## Running Tests

```bash
npx hardhat test
```

## Verifying Contracts

After deployment, you can verify your contracts on the explorer:

```bash
npx hardhat verify --network monadTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Monad Network Information

### Monad Testnet
- **Chain ID**: 10143
- **Explorer**: https://testnet.monadexplorer.com/
- **RPC URL**: Configure in `hardhat.config.ts`
- **Currency Symbol**: MON
- **Block Explorer API**: Configured in `hardhat.config.ts` for contract verification

### Adding Monad Testnet to MetaMask

1. Open MetaMask and click the network dropdown
2. Click "Add Network" or "Add a network manually"
3. Enter the following details:
   - **Network Name**: Monad Testnet
   - **RPC URL**: `https://monad-testnet.g.alchemy.com/v2/YOUR_API_KEY` (or your preferred RPC)
   - **Chain ID**: `10143`
   - **Currency Symbol**: `MON`
   - **Block Explorer URL**: `https://testnet.monadexplorer.com/`

4. Click "Save" to add the network

## Post-Setup Checklist

After completing the setup, verify everything works:

- [ ] Dependencies installed (`npm install` completed successfully)
- [ ] `.env` file created with `DEPLOYER_ACCOUNT_PRIV_KEY`
- [ ] Network configured in `hardhat.config.ts`
- [ ] Contracts compile successfully (`npx hardhat compile`)
- [ ] Wallet has testnet tokens
- [ ] Successfully deployed at least one oracle contract
- [ ] Successfully read price from deployed oracle

## Troubleshooting

### Setup Issues

#### Issue: "Cannot find module" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "Invalid private key" error

**Causes:**
- Private key includes `0x` prefix (remove it)
- Private key is incorrect format
- `.env` file not found

**Solution:**
```env
# Wrong:
DEPLOYER_ACCOUNT_PRIV_KEY=0x1234...

# Correct:
DEPLOYER_ACCOUNT_PRIV_KEY=1234...
```

#### Issue: "Cannot read properties of undefined" when running scripts

**Solution:**
- Ensure `.env` file exists and has correct variable name
- Check that `dotenv` is installed: `npm list dotenv`
- Verify `hardhat.config.ts` imports dotenv: `import "dotenv/config";`

### Deployment Issues

#### Issue: "Insufficient funds" error

**Solution:**
1. Check your wallet balance on Monad testnet explorer
2. Get testnet tokens from Monad faucet
3. Verify you're using the correct network in your command

#### Issue: "Contract deployment failed"

**Possible causes:**
- Network RPC URL is incorrect or unreachable
- Gas limit too low
- Contract constructor parameters incorrect

**Solution:**
```bash
# Test network connection
npx hardhat run scripts/pyth/deploy.pythoracle.ts --network monadTestnet --verbose

# Check RPC URL in hardhat.config.ts
# Try a different RPC endpoint
```

#### Issue: "Contract not found" error when reading

**Solution:**
1. Verify contract was deployed successfully
2. Check contract address is correct in read script
3. Ensure you're using the same network
4. Verify contract exists on explorer

### Oracle-Specific Issues

#### Issue: "Price feed not found" (Pyth)

**Solution:**
- Verify price feed ID is correct (check Pyth documentation)
- Ensure feed exists on Monad network
- Check feed ID format (should be bytes32, starting with 0x)

#### Issue: "Price is stale" or "Price too old"

**Solution:**
- Some oracles have staleness checks
- Update the oracle feed before reading
- Check oracle documentation for update requirements

#### Issue: "Insufficient fee" (Switchboard)

**Solution:**
- Switchboard requires payment for updates
- Calculate required fee: `uint256 fees = switchboard.getFee(updates);`
- Send enough ETH with the transaction

### Network Issues

#### Issue: "Network connection timeout"

**Solution:**
1. Check your internet connection
2. Try a different RPC endpoint
3. Verify RPC URL is correct
4. Check if RPC provider has rate limits

#### Issue: "Chain ID mismatch"

**Solution:**
- Verify chain ID in `hardhat.config.ts` matches network
- Monad Testnet chain ID: `10143`
- Check MetaMask network settings if using it

### Compilation Issues

#### Issue: "Compiler version mismatch"

**Solution:**
- Check Solidity version in `hardhat.config.ts`
- Ensure version matches contract pragma statements
- Try updating Hardhat: `npm install --save-dev hardhat@latest`

#### Issue: "Missing import" errors

**Solution:**
- Ensure all dependencies are installed: `npm install`
- Check if oracle SDK packages are installed
- Verify import paths are correct

### Getting Help

If you encounter issues not covered here:

1. **Check Logs**: Look at the full error message for clues
2. **Verify Setup**: Go through the setup checklist again
3. **Test Locally**: Try deploying to Hardhat local network first
4. **Check Documentation**: Review oracle provider documentation
5. **Community**: Ask in Monad or oracle provider Discord/forums

### Debug Mode

Enable verbose logging:

```bash
# Add --verbose flag
npx hardhat run scripts/pyth/deploy.pythoracle.ts --network monadTestnet --verbose

# Or use Hardhat console for interactive debugging
npx hardhat console --network monadTestnet
```

## Contributing

When adding new oracle integrations:

1. Create a new directory under `contracts/` for your oracle
2. Add deployment scripts under `scripts/`
3. Add read scripts for testing
4. Update this README with usage instructions

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Pyth Network Documentation](https://docs.pyth.network/)
- [Chronicle Documentation](https://docs.chroniclelabs.org/)
- [Redstone Documentation](https://docs.redstone.finance/)
- [Stork Network Documentation](https://docs.stork.network/)
- [Switchboard Documentation](https://docs.switchboard.xyz/)

## License

This project is provided as-is for educational and development purposes. Check individual oracle provider licenses for their specific terms.

## Support

For issues specific to:
- **Monad Network**: Check [Monad Documentation](https://docs.monad.xyz/)
- **Oracle Providers**: Refer to their respective documentation
- **Hardhat**: Check [Hardhat Troubleshooting Guide](https://hardhat.org/troubleshooting)

---

**Note**: Always test thoroughly on Monad testnet before deploying to Monad mainnet (when available). Oracle integrations handle critical price data, so ensure proper error handling and validation in your production contracts.
