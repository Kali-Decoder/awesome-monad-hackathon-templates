import { CrossbarClient } from '@switchboard-xyz/common';
import { ethers } from 'ethers';
import * as dotenv from "dotenv";
import * as fs from 'fs';
import * as path from 'path';
dotenv.config();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function normalizeFeedHash(hash: string): string {
    return hash.startsWith('0x') ? hash : '0x' + hash;
}

function formatValue(value: bigint, decimals: number = 18): string {
    const divisor = 10n ** BigInt(decimals);
    const whole = value / divisor;
    const fraction = value % divisor;

    if (fraction === 0n) {
        return whole.toString();
    }

    const fractionStr = fraction.toString().padStart(decimals, '0');
    const trimmed = fractionStr.replace(/0+$/, '');
    return `${whole}.${trimmed}`;
}

function loadDeployments(): any {
    const deploymentsPath = path.join(__dirname, '..', 'deployments.json');
    if (!fs.existsSync(deploymentsPath)) {
        throw new Error('deployments.json not found. Please deploy the contract first.');
    }
    return JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
}

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

interface NetworkConfig {
    name: string;
    chainId: number;
    explorer: string;
    switchboard: string;
    verifier?: string;
    queue?: string;
}

const NETWORKS: Record<string, NetworkConfig> = {
    'monad-testnet': {
        name: 'Monad Testnet',
        chainId: 10143,
        explorer: 'https://testnet.monadscan.io',
        switchboard: '0xD3860E2C66cBd5c969Fa7343e6912Eff0416bA33',
    },
    'monad-mainnet': {
        name: 'Monad Mainnet',
        chainId: 143,
        explorer: 'https://mainnet-beta.monvision.io',
        switchboard: '0xB7F03eee7B9F56347e32cC71DaD65B303D5a0E67',
    },
};

// ============================================================================
// FEED CONFIGURATION
// ============================================================================

interface FeedConfig {
    name: string;
    hash: string;
}

const FEEDS: FeedConfig[] = [
    {
        name: 'BTC/USD',
        hash: '0x4cd1cad962425681af07b9254b7d804de3ca3446fbfd1371bb258d2c75059812'
    },
    {
        name: 'ETH/USD',
        hash: '0xa0950ee5ee117b2e2c30f154a69e17bfb489a7610c508dc5f67eb2a14616d8ea'
    },
    {
        name: 'SOL/USD',
        hash: '0x822512ee9add93518eca1c105a38422841a76c590db079eebb283deb2c14caa9'
    },
    {
        name: 'SUI/USD',
        hash: '0x7ceef94f404e660925ea4b33353ff303effaf901f224bdee50df3a714c1299e9'
    }
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
    rpcUrl: process.env.RPC_URL || 'https://testnet-rpc.monad.xyz',
    privateKey: process.env.PRIVATE_KEY || '',
    network: (process.env.NETWORK || 'monad-testnet') as keyof typeof NETWORKS,
    feeds: FEEDS, // Use all feeds by default
    maxPriceAge: parseInt(process.env.MAX_PRICE_AGE || '300'), // 5 minutes
    maxDeviationBps: parseInt(process.env.MAX_DEVIATION_BPS || '1000'), // 10%
};

// ============================================================================
// CONTRACT ABIs
// ============================================================================

const SWITCHBOARD_ABI = [
    'function updateFeeds(bytes[] calldata updates) external payable',
    'function getFee(bytes[] calldata updates) external view returns (uint256)',
    'function latestUpdate(bytes32 feedId) external view returns (tuple(bytes32 feedId, int128 result, uint256 timestamp, uint64 slotNumber))',
];

const PRICE_CONSUMER_ABI = [
    'constructor(address _switchboard)',
    'function updatePrices(bytes[] calldata updates, bytes32[] calldata feedIds) external payable',
    'function getPrice(bytes32 feedId) external view returns (int128 value, uint256 timestamp, uint64 slotNumber)',
    'function isPriceFresh(bytes32 feedId) external view returns (bool)',
    'function getPriceAge(bytes32 feedId) external view returns (uint256)',
    'function maxPriceAge() external view returns (uint256)',
    'function maxDeviationBps() external view returns (uint256)',
    'function owner() external view returns (address)',
    'event PriceUpdated(bytes32 indexed feedId, int128 oldPrice, int128 newPrice, uint256 timestamp, uint64 slotNumber)',
    'event PriceValidationFailed(bytes32 indexed feedId, string reason)',
];

// ============================================================================
// FETCH FEED DATA FROM SWITCHBOARD CROSSBAR
// ============================================================================

interface FeedData {
    name: string;
    feedHash: string;
    value: string;
    timestamp: number;
    slot: number;
    numOracles: number;
    encoded: string;
}

async function fetchFeedData(feeds: FeedConfig[]): Promise<FeedData[]> {
    console.log('\n' + '='.repeat(60));
    console.log('📡 STEP 1: Fetching Feed Data from Switchboard Crossbar');
    console.log('='.repeat(60));
    
    console.log(`\n🔍 Fetching ${feeds.length} feed(s)...`);
    console.log(`📡 Connecting to Switchboard Crossbar API...`);

    try {
        const crossbar = new CrossbarClient('https://crossbar.switchboard.xyz');
        
        // Prepare feed hashes for Crossbar (without 0x prefix)
        const feedHashesForCrossbar = feeds.map(feed => {
            const normalized = normalizeFeedHash(feed.hash);
            return normalized.startsWith('0x') ? normalized.slice(2) : normalized;
        });

        console.log(`⏳ Fetching oracle quotes for ${feeds.length} feed(s)...`);
        
        const response = await crossbar.fetchOracleQuote(
            feedHashesForCrossbar,
            'mainnet'
        );

        if (!response.encoded) {
            throw new Error('No encoded data in response');
        }

        if (!response.medianResponses || response.medianResponses.length !== feeds.length) {
            throw new Error(`Expected ${feeds.length} median responses, got ${response.medianResponses?.length || 0}`);
        }

        const feedDataArray: FeedData[] = [];

        console.log('\n✅ Feed Data Retrieved Successfully:');
        console.log('-'.repeat(60));

        for (let i = 0; i < feeds.length; i++) {
            const feed = feeds[i];
            const medianResponse = response.medianResponses[i];
            const normalizedFeedHash = normalizeFeedHash(feed.hash);

            if (!medianResponse) {
                throw new Error(`No median response for feed ${feed.name} (${normalizedFeedHash})`);
            }

            console.log(`\n   📊 ${feed.name}:`);
            console.log(`      Feed Hash: ${normalizedFeedHash}`);
            console.log(`      Value: ${formatValue(BigInt(medianResponse.value))}`);
            console.log(`      Timestamp: ${new Date(response.timestamp * 1000).toISOString()}`);
            console.log(`      Slot Number: ${response.slot}`);
            console.log(`      Oracles: ${response.oracleResponses.length}`);

            feedDataArray.push({
                name: feed.name,
                feedHash: normalizedFeedHash,
                value: medianResponse.value,
                timestamp: response.timestamp,
                slot: response.slot,
                numOracles: response.oracleResponses.length,
                encoded: response.encoded, // All feeds share the same encoded data
            });
        }

        console.log(`\n   📦 Encoded Data Length: ${response.encoded.length} bytes`);
        console.log(`   ✅ Successfully fetched ${feedDataArray.length} feed(s)`);

        return feedDataArray;
    } catch (error: any) {
        console.error('\n❌ Error fetching feed data:');
        console.error(`   ${error.message}`);
        throw new Error(`Failed to fetch feed data: ${error.message}`);
    }
}

// ============================================================================
// UPDATE PRICES ON CHAIN
// ============================================================================

async function updatePrices() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Switchboard Price Consumer - Update Prices');
    console.log('='.repeat(60));

    // Step 1: Validate Configuration
    console.log('\n📋 STEP 1: Validating Configuration');
    console.log('-'.repeat(60));
    
    if (!config.rpcUrl) {
        throw new Error('❌ RPC_URL environment variable is required');
    }
    console.log(`✅ RPC URL: ${config.rpcUrl}`);
    
    if (!config.privateKey) {
        throw new Error('❌ PRIVATE_KEY environment variable is required');
    }
    console.log(`✅ Private Key: ${config.privateKey.slice(0, 6)}...${config.privateKey.slice(-4)} (hidden)`);
    
    const networkConfig = NETWORKS[config.network];
    if (!networkConfig) {
        throw new Error(`❌ Unknown network: ${config.network}`);
    }
    console.log(`✅ Network: ${networkConfig.name} (Chain ID: ${networkConfig.chainId})`);
    console.log(`✅ Feeds to update: ${config.feeds.length}`);
    config.feeds.forEach((feed, index) => {
        console.log(`   ${index + 1}. ${feed.name}: ${feed.hash}`);
    });

    // Step 2: Load Deployments
    console.log('\n📋 STEP 2: Loading Contract Addresses');
    console.log('-'.repeat(60));
    
    let deployments;
    try {
        deployments = loadDeployments();
        console.log('✅ Loaded deployments.json');
    } catch (error: any) {
        console.error(`❌ ${error.message}`);
        throw error;
    }

    const networkKey = config.network === 'monad-testnet' ? 'monadTestnet' : 'monadTestnet';
    const deployment = deployments[networkKey]?.SwitchBoardTest;
    
    if (!deployment) {
        throw new Error(`❌ No deployment found for ${networkKey}. Please deploy the contract first.`);
    }

    const priceConsumerAddress = deployment.address;
    const switchboardAddress = networkConfig.switchboard;
    
    console.log(`✅ Price Consumer Contract: ${priceConsumerAddress}`);
    console.log(`✅ Switchboard Contract: ${switchboardAddress}`);

    // Step 3: Setup Provider and Signer
    console.log('\n📋 STEP 3: Setting Up Provider and Signer');
    console.log('-'.repeat(60));
    
    const network = new ethers.Network(networkConfig.name, networkConfig.chainId);
    const provider = new ethers.JsonRpcProvider(config.rpcUrl, network, {
        staticNetwork: true,
    });
    
    const signer = new ethers.Wallet(config.privateKey, provider);
    const signerAddress = await signer.getAddress();
    console.log(`✅ Provider connected to: ${config.rpcUrl}`);
    console.log(`✅ Signer address: ${signerAddress}`);
    
    const balance = await provider.getBalance(signerAddress);
    console.log(`✅ Account balance: ${ethers.formatEther(balance)} ETH`);

    // Step 4: Fetch Feed Data
    const feedDataArray = await fetchFeedData(config.feeds);

    // Step 5: Get Required Fee
    console.log('\n📋 STEP 4: Calculating Required Fee');
    console.log('-'.repeat(60));
    
    const switchboard = new ethers.Contract(
        switchboardAddress,
        SWITCHBOARD_ABI,
        signer
    );
    
    // All feeds share the same encoded data from Crossbar
    const encodedUpdates = [feedDataArray[0].encoded];
    
    console.log(`⏳ Querying switchboard for update fee for ${feedDataArray.length} feed(s)...`);
    const fee = await switchboard.getFee(encodedUpdates);
    console.log(`✅ Required fee: ${ethers.formatEther(fee)} ETH (${fee.toString()} wei)`);
    
    if (balance < fee) {
        throw new Error(`❌ Insufficient balance. Need ${ethers.formatEther(fee)} ETH, have ${ethers.formatEther(balance)} ETH`);
    }

    // Step 6: Submit Transaction
    console.log('\n📋 STEP 5: Submitting Update Transaction');
    console.log('-'.repeat(60));
    
    const priceConsumer = new ethers.Contract(
        priceConsumerAddress,
        PRICE_CONSUMER_ABI,
        signer
    );
    
    // Prepare feed IDs for the transaction
    const feedIds = feedDataArray.map(feed => feed.feedHash);
    
    console.log(`📝 Preparing transaction...`);
    console.log(`   Contract: ${priceConsumerAddress}`);
    console.log(`   Feeds to update: ${feedDataArray.length}`);
    feedDataArray.forEach((feed, index) => {
        console.log(`   ${index + 1}. ${feed.name}: ${feed.feedHash}`);
    });
    console.log(`   Value: ${ethers.formatEther(fee)} ETH`);
    
    console.log(`\n⏳ Sending transaction...`);
    const tx = await priceConsumer.updatePrices(
        encodedUpdates,
        feedIds,
        { value: fee }
    );
    
    console.log(`✅ Transaction submitted!`);
    console.log(`   Transaction Hash: ${tx.hash}`);
    console.log(`   Explorer: ${networkConfig.explorer}/tx/${tx.hash}`);
    console.log(`\n⏳ Waiting for confirmation...`);

    const receipt = await tx.wait();
    
    console.log('\n✅ Transaction Confirmed!');
    console.log('-'.repeat(60));
    console.log(`   Block Number: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`   Status: ${receipt.status === 1 ? '✅ Success' : '❌ Failed'}`);
    console.log(`   Explorer: ${networkConfig.explorer}/tx/${receipt.hash}`);

    // Step 7: Verify Price Updates
    console.log('\n📋 STEP 6: Verifying Price Updates');
    console.log('-'.repeat(60));
    
    console.log(`⏳ Querying on-chain price data for ${feedDataArray.length} feed(s)...`);
    
    const maxPriceAge = await priceConsumer.maxPriceAge();
    const maxDeviationBps = await priceConsumer.maxDeviationBps();

    console.log('\n📊 On-Chain Price Data:');
    console.log('-'.repeat(60));

    for (const feedData of feedDataArray) {
        const feedId = feedData.feedHash;
        console.log(`\n   📊 ${feedData.name}:`);
        
        try {
            const [value, timestamp, slotNumber] = await priceConsumer.getPrice(feedId);
            const isFresh = await priceConsumer.isPriceFresh(feedId);
            const age = await priceConsumer.getPriceAge(feedId);

            console.log(`      Feed ID: ${feedId}`);
            console.log(`      Value: ${formatValue(value)}`);
            console.log(`      Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);
            console.log(`      Slot Number: ${slotNumber.toString()}`);
            console.log(`      Price Age: ${age.toString()} seconds`);
            console.log(`      Max Price Age: ${maxPriceAge.toString()} seconds`);
            console.log(`      Is Fresh: ${isFresh ? '✅ Yes' : '❌ No'}`);
            console.log(`      Max Deviation: ${maxDeviationBps.toString()} bps (${Number(maxDeviationBps) / 100}%)`);
        } catch (error: any) {
            console.log(`      ❌ Error reading price: ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Price Update Complete!');
    console.log('='.repeat(60) + '\n');
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
    try {
        await updatePrices();
    } catch (error: any) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ ERROR: Operation Failed');
        console.error('='.repeat(60));
        console.error(`\n${error.message}\n`);
        if (error.stack) {
            console.error('Stack trace:');
            console.error(error.stack);
        }
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('\n❌ Unhandled error:', error);
    process.exit(1);
});
