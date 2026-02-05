import { ethers } from "hardhat";
async function getValue() {
  const CONTRACT_NAME = "PriceFeedBase";
  const PRICE_FEED_ADDRESS = "0x85C4F855Bc0609D2584405819EdAEa3aDAbfE97D";
  const sender = new ethers.Wallet(
    process.env.DEPLOYER_ACCOUNT_PRIV_KEY as any,
    ethers.provider
  );
  console.log("Deployer address:", sender.address);
  console.log("Reading value by redstone contract...");
  const redStoneContract = await ethers.getContractAt(
    CONTRACT_NAME,
    PRICE_FEED_ADDRESS,
    sender
  );
  const latestRoundData = await redStoneContract.latestRoundData();
  const price = ethers.formatUnits(latestRoundData.answer, 8);
  console.log("Value in 8 Decimals :", price);
}

async function main() {
  await getValue();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
