import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    base_sepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${
        process.env.ALCHEMY_SEPOLIA_KEY ?? ""
      }`,
      accounts: {
        mnemonic: process.env.MNEMONIC ?? "",
      },
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.basescan.org/",
          apiKey: process.env.ETHERSCAN_API_KEY,
        },
      },
    },
    base_mainnet: {
      url: `https://base-mainnet.g.alchemy.com/v2/${
        process.env.ALCHEMY_MAINNET_KEY ?? ""
      }`,
      accounts: {
        mnemonic: process.env.MNEMONIC ?? "",
      },
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org/",
          apiKey: process.env.ETHERSCAN_API_KEY,
        },
      },
    },
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${
          process.env.ALCHEMY_MAINNET_KEY ?? ""
        }`,
        enabled: true,
      },
    },
  },
};

export default config;
