import { ethers } from "hardhat";
async function getValue() {
  const CONTRACT_NAME = "Oracle_Pyth";
  const pythId =
    "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f";
  const PythAddress = "0x7cE7845bDE4277e8Aa132aC4c042605e7d42B71C";
  const sender = new ethers.Wallet(
    process.env.DEPLOYER_ACCOUNT_PRIV_KEY as any,
    ethers.provider
  );
  console.log("Deployer address:", sender.address);
  console.log("Reading value by pythId...");
  const pythContract = await ethers.getContractAt(
    CONTRACT_NAME,
    PythAddress,
    sender
  );
  const value = await pythContract.read(pythId);
  console.log("Value in 18 Decimals :", value);
}

async function main() {
  await getValue();
}


main().catch((error) => {
  console.error(error);
  process.exit(1);
});
