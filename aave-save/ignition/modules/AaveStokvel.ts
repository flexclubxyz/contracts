import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AaveStokvelModule = buildModule("AaveStokvelModule", (m) => {
  // change logic to incorporate testnet/mainnet switching
  const addressProvider = "0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b";
  const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  const contract = m.contract("AaveStokvel", [addressProvider, usdcAddress]);

  return { contract };
});

export default AaveStokvelModule;
