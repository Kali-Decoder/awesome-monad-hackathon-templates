import { ethers } from "hardhat";

async function deployPythContract() {
  const CONTRACT_NAME = "Oracle_Pyth";
  const PYTH_ADDRESS="0x2880aB155794e7179c9eE2e38200202908C17B43"
  console.log("Deploying...");
  const pyth = await ethers.deployContract(CONTRACT_NAME, [PYTH_ADDRESS]);
  await pyth.waitForDeployment();
  console.log("Deployed Pyth Contract Address:", await pyth.getAddress());
}

async function main() {
  await deployPythContract();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
