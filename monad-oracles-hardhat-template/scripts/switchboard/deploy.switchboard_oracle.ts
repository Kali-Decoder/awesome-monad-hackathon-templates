import { ethers } from "hardhat";
async function deployPythContract() {
  const CONTRACT_NAME = "SwitchboardOracleReader";
  const _switchboard = "0x33A5066f65f66161bEb3f827A3e40fce7d7A2e6C";
  const _aggregatorId = "";
  console.log("Deploying...");
  const switchboardOracle = await ethers.deployContract(CONTRACT_NAME, [
    _switchboard,
    _aggregatorId,
  ]);
  await switchboardOracle.waitForDeployment();
  console.log(
    "Deployed Switch Board Oracle Contract Address:",
    await switchboardOracle.getAddress()
  );
}

async function main() {
  await deployPythContract();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
