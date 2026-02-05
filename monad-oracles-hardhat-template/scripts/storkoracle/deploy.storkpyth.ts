import { ethers } from "hardhat";

async function deployChronicleOracle() {
  const CONTRACT_NAME = "TestStorkPythAdapter";
  const storkPythAdapterAddress = "0xacC0a0cF13571d30B4b8637996F5D6D774d4fd62";
  const assetId =
    "0x7404e3d104ea7841c3d9e6fd20adfe99b4ad586bc08d8f3bd3afef894cf184de"; // BTCUSD
  console.log("Deploying...");
  const pythStorkOracle = await ethers.deployContract(CONTRACT_NAME, [
    storkPythAdapterAddress,
    assetId,
  ]);
  await pythStorkOracle.waitForDeployment();
  console.log(
    "Deployed Pyth StorkOracle Contract Address:",
    await pythStorkOracle.getAddress()
  );
}
async function main() {
  await deployChronicleOracle();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
