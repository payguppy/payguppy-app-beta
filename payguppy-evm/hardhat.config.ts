import type { HardhatUserConfig } from "hardhat/config";

import 'hardhat-deploy'
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.28',
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
      },
    ]
  },
  networks: {
    liskTestnet: {
      url: 'https://rpc.sepolia-api.lisk.com',
      accounts: [
        ''
      ]
    },
    monadTestnet: {
      url: 'https://testnet-rpc.monad.xyz',
      accounts: [
        ''
      ]
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    
    showTimeSpent: true,
  },
  namedAccounts: {
    deployer: 0,
  }
};

export default config;
