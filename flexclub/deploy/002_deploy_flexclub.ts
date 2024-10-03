// deploy/002_deploy_FlexClub002.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const usdcTokenAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base Mainnet
  const aaveProviderAddress = "0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D"; // Aave PoolAddressesProvider on Base Mainnet
  const aTokenAddress = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB"; // aToken address for USDC on Base Mainnet

  const deadline = 1734230400; // Unix timestamp for 15 February 2025
  const goalName = "Farcon 2025";
  const goalDescription = "Save to attend Farcon 2025";
  const targetAmount = 5000 * 10 ** 6; // 5000 USDC with 6 decimals

  await deploy("FlexClub002", {
    from: deployer,
    args: [
      usdcTokenAddress,
      aaveProviderAddress,
      deadline,
      goalName,
      goalDescription,
      targetAmount,
      aTokenAddress,
    ],
    log: true,
  });
};

export default func;
func.tags = ["FlexClub002"];
