import { ethers } from "hardhat";

async function deployChronicleOracle() {
  const CONTRACT_NAME = "TestStorkChainlinkAdapter";
  const storkChainlinkAdapterAddress =
    "0xacC0a0cF13571d30B4b8637996F5D6D774d4fd62";
  const assetId =
    "0x59102b37de83bdda9f38ac8254e596f0d9ac61d2035c07936675e87342817160"; // ETHUSD
  console.log("Deploying...");
  const storkChainlink = await ethers.deployContract(CONTRACT_NAME, [
    storkChainlinkAdapterAddress,
    assetId,
  ]);
  await storkChainlink.waitForDeployment();
  console.log(
    "Deployed storkChainlink Contract Address:",
    await storkChainlink.getAddress()
  );
}
async function main() {
  await deployChronicleOracle();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
