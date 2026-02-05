import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function deploySwitchBoardTest() {
  const CONTRACT_NAME = "SwitchBoardTest";
  const switchboardAddress = "0xD3860E2C66cBd5c969Fa7343e6912Eff0416bA33";// Monad Testnet 
  const switchBoardTest = await ethers.deployContract(CONTRACT_NAME, [
    switchboardAddress,
  ]);
  await switchBoardTest.waitForDeployment();
  
  const deployedAddress = await switchBoardTest.getAddress();
  console.log(
    "Deployed SwitchBoardTest contract address:",
    deployedAddress
  );

  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "monadTestnet" : network.name;
  
  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  let deployments: any = {};
  
  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }
  
  if (!deployments[networkName]) {
    deployments[networkName] = {};
  }
  
  deployments[networkName][CONTRACT_NAME] = {
    address: deployedAddress,
    switchboardAddress: switchboardAddress,
    deployedAt: new Date().toISOString(),
    chainId: network.chainId.toString(),
  };

  fs.writeFileSync(
    deploymentsPath,
    JSON.stringify(deployments, null, 2),
    "utf8"
  );
  
  console.log(`Deployment information saved to deployments.json`);
}

async function main() {
  await deploySwitchBoardTest();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
