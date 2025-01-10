import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Donation wallet address
  const donationWallet = "0x7370E25CFeD6053cb8111899959b195f39c6e2BC";

  // Deadline: Unix timestamp for November 10, 2024
  // November 10, 2024, 23:59:59 UTC converted to Unix timestamp is 1731283199
  const deadline = 1731283199; // 10 November 2024, 23:59:59 UTC

  // Goal details
  const goalName = "ETHGlobal Fundraiser";
  const goalDescription =
    "Raising Funds for gabrieltemtsen to attend ETHGlobal Bangkok";
  const targetAmountInETH = "0.49"; // Target amount in ETH ~$1300
  const targetAmount = ethers.utils.parseEther(targetAmountInETH); // Converts ETH to wei

  await deploy("FlexClub004", {
    from: deployer,
    args: [donationWallet, deadline, goalName, goalDescription, targetAmount],
    log: true,
  });
};

export default func;
func.tags = ["FlexClub004"];
