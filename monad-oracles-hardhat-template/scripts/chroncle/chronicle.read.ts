import { ethers } from "hardhat";
async function getValue() {
  const CONTRACT_NAME = "OracleReader";
  const ChronicleAddress = "0xDCCE229f6019A5A2Ef388e472f86F70105a6fA95";
  const CHOICE= 1;
  const sender = new ethers.Wallet(
    process.env.DEPLOYER_ACCOUNT_PRIV_KEY as any,
    ethers.provider
  );
  console.log("Deployer address:", sender.address);
  const chronicleContract = await ethers.getContractAt(
    CONTRACT_NAME,
    ChronicleAddress,
    sender
  );

  // 86493601898298108975910
  const value = await chronicleContract.read(CHOICE);
  console.log("Read Value From Chronicle:", value);
}

async function main() {
  await getValue();
}


main().catch((error) => {
  console.error(error);
  process.exit(1);
});
