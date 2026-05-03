require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    arc: {
      url: "https://rpc.testnet.arc.network",
      chainId: 5042002,
      // Use private key from env or default hardhat account
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      arc: "abc", // placeholder
    },
    customChains: [{
      network: "arc",
      chainId: 5042002,
      urls: {
        apiURL: "https://api.testnet.arcscan.app/api",
        browserURL: "https://testnet.arcscan.app",
      },
    }],
  },
};
