import "dotenv/config";
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "StakingRewards";
const STAKING_TOKEN_ADDRESS = "0x534b2f3A21130d7a60830c2Df862319e593943A3"; // USDC ON MONAD TESTNET 
const REWARD_TOKEN_ADDRESS = "0x40D419F6aE98cF4726825f59718dc2cDB4F43bf5"; // Custom Reward Token Address

async function main(): Promise<void> {
  console.log("\nDeploying", CONTRACT_NAME, "...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (!STAKING_TOKEN_ADDRESS) {
    throw new Error("STAKING_TOKEN_ADDRESS missing in .env");
  }

  if (!REWARD_TOKEN_ADDRESS) {
    throw new Error("REWARD_TOKEN_ADDRESS missing in .env");
  }

  console.log("Config:");
  console.log("Staking Token:", STAKING_TOKEN_ADDRESS);
  console.log("Reward Token:", REWARD_TOKEN_ADDRESS);

  console.log("Deploying...");
  const Contract = await hre.ethers.getContractFactory(CONTRACT_NAME);
  const contract = await Contract.deploy(STAKING_TOKEN_ADDRESS, REWARD_TOKEN_ADDRESS);

  await contract.waitForDeployment();
  const contractAddress = String(contract.target);

  console.log("Contract deployed:", contractAddress);

  const network = hre.network.name;
  const chainId = hre.network.config.chainId;

  const addresses = {
    contract: CONTRACT_NAME,
    address: contractAddress,
    stakingToken: STAKING_TOKEN_ADDRESS,
    rewardToken: REWARD_TOKEN_ADDRESS,
    network,
    chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const filePath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));

  console.log("\nSaved to:", filePath);
  console.log("Contract:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
