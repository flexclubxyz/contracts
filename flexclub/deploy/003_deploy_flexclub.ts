// deploy/003_deploy_FlexClub003.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Donation wallet address (replace with the actual donation wallet address)
  const donationWallet = "DonationWalletAddress";

  // Deadline: Unix timestamp for 20 October 2024
  const deadline = 1729468799; // 20 October 2024, 23:59:59 UTC

  // Goal details
  const goalName = "Devcon Fundraiser for Ash";
  const goalDescription = "Raising funds for Devcon trip";
  const targetAmountInETH = "0.44"; // Target amount in ETH // $10069
  const targetAmount = ethers.utils.parseEther(targetAmountInETH); // Converts ETH to wei

  await deploy("FlexClub003", {
    from: deployer,
    args: [donationWallet, deadline, goalName, goalDescription, targetAmount],
    log: true,
  });
};

export default func;
func.tags = ["FlexClub003"];
