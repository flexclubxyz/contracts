import { ethers, deployments } from "hardhat";
import { Signer } from "ethers";

async function main() {
  const flexClubDeployment = await deployments.get("FlexClub");

  const flexClubAddress = flexClubDeployment.address;
  const usdcTokenAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Real USDC address on Sepolia

  const signers: Signer[] = await ethers.getSigners();
  const deployer: Signer = signers[0];
  const user: Signer = signers[1];

  const flexClub = await ethers.getContractAt(
    "FlexClub",
    flexClubAddress,
    deployer
  );
  const usdc = await ethers.getContractAt("IERC20", usdcTokenAddress, deployer);

  const depositAmount = ethers.utils.parseUnits("100", 6); // 100 USDC
  const allowanceAmount = ethers.utils.parseUnits("500", 6); // Larger allowance to be safe

  console.log("Minting USDC to the user...");

  // Assuming you already have real USDC, skip minting step
  const userBalance = await usdc.balanceOf(await user.getAddress());
  console.log(
    `User's USDC balance: ${ethers.utils.formatUnits(userBalance, 6)}`
  );

  console.log("Approving USDC for FlexClub contract...");
  await usdc.connect(user).approve(flexClubAddress, allowanceAmount);

  const allowance = await usdc.allowance(
    await user.getAddress(),
    flexClubAddress
  );
  console.log(
    `Allowance set for FlexClub contract: ${ethers.utils.formatUnits(
      allowance,
      6
    )}`
  );

  if (allowance.lt(depositAmount)) {
    console.error("Allowance is less than the deposit amount.");
    return;
  }

  const gasLimit = 300000; // Set an explicit gas limit

  try {
    const tx = await flexClub
      .connect(user)
      .deposit(depositAmount, "Goal 1", "Goal Description", 1000, 1711814400, {
        gasLimit,
      });
    await tx.wait();
    console.log("USDC deposited to FlexClub contract");
  } catch (error) {
    console.error("Error during deposit:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
