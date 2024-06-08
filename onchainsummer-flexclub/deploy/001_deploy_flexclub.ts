// deploy/001_deploy_FlexClub.ts

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const usdcTokenAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC on Sepolia
  const aaveProviderAddress = "0xd449FeD49d9C443688d6816fE6872F21402e41de"; // Aave PoolAddressesProvider on Sepolia

  await deploy("FlexClub", {
    from: deployer,
    args: [usdcTokenAddress, aaveProviderAddress],
    log: true,
  });
};

export default func;
func.tags = ["FlexClub"];
