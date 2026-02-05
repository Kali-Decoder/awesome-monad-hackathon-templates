import { ethers } from "hardhat";
async function getValue() {
  const CONTRACT_NAME = "TestStorkChainlinkAdapter";
  const storkChainlinkAdapterAddress = "0x92919b7B47870bfafed0D93ef9E1f8b1e1cbEAca";
  const sender = new ethers.Wallet(
    process.env.DEPLOYER_ACCOUNT_PRIV_KEY as any,
    ethers.provider
  );
  console.log("Deployer address:", sender.address);
  const storkChainlinkContract = await ethers.getContractAt(
    CONTRACT_NAME,
    storkChainlinkAdapterAddress,
    sender
  );

  const value = await storkChainlinkContract.latestRoundData();
  console.log("Read Value From Stork Oracle:", value);
}
async function main() {
  await getValue();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
