import { ethers } from "hardhat";

async function deployChronicleOracle() {
  const CONTRACT_NAME = "OracleReader";
  console.log("Deploying...");
  const chronicle = await ethers.deployContract(CONTRACT_NAME, []);
  await chronicle.waitForDeployment();
  console.log("Deployed chronicle Contract Address:", await chronicle.getAddress());
}
async function main() {
  await deployChronicleOracle();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
