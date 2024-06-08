// deploy/001_deploy_FlexClub.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const usdcTokenAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Real USDC on Sepolia
  const aaveProviderAddress = "0xd449FeD49d9C443688d6816fE6872F21402e41de"; // Aave PoolAddressesProvider on Sepolia
  const aTokenAddress = "0xf53B60F4006cab2b3C4688ce41fD5362427A2A66"; // aToken address for USDC on Sepolia

  const deadline = 1725926400; // Unix timestamp for 10 October 2024
  const goalName = "Devcon Bangkok Trip";
  const goalDescription = "Saving to attend DevCon 2024 in Bangkok";
  const targetAmount = 800 * 10 ** 6; // 800 USDC with 6 decimals

  await deploy("FlexClub", {
    from: deployer,
    args: [
      usdcTokenAddress,
      aaveProviderAddress,
      deadline,
      goalName,
      goalDescription,
      targetAmount,
      aTokenAddress, // Add aToken address
    ],
    log: true,
  });
};

export default func;
func.tags = ["FlexClub"];
