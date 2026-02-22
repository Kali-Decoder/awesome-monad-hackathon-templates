import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "RewardToken";

async function main(): Promise<void> {
  console.log("\nDeploying", CONTRACT_NAME, "...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  const Contract = await hre.ethers.getContractFactory(CONTRACT_NAME);
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const contractAddress = String(contract.target);
  console.log("RewardToken deployed:", contractAddress);

  const network = hre.network.name;
  const chainId = hre.network.config.chainId;

  const output = {
    contract: CONTRACT_NAME,
    rewardToken: contractAddress,
    network,
    chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const filePath = path.join(__dirname, "..", "reward-token-address.json");
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));

  console.log("Saved to:", filePath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
