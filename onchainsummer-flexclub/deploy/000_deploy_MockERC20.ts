// deploy/000_deploy_MockERC20.ts

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("MockERC20", {
    from: deployer,
    args: ["Mock USDC", "mUSDC"],
    log: true,
  });
};

export default func;
func.tags = ["MockERC20"];
