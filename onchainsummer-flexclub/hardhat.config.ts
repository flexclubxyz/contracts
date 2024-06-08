import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    // base_goerli: {
    //   url: "https://goerli.base.org",
    //   accounts: {
    //     mnemonic: process.env.MNEMONIC ?? "",
    //   },
    // },
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
    // mumbai: {
    //   url: `https://polygon-mumbai.g.alchemy.com/v2/${
    //     process.env.ALCHEMY_MUMBAI_KEY ?? ""
    //   }`,
    //   accounts: {
    //     mnemonic: process.env.MNEMONIC ?? "",
    //   },
    // },
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
