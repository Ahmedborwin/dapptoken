require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("solidity-coverage");

const PRIVATE_KEY_METAMASK = process.env.PRIVATE_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {},
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY_METAMASK],
      chainId: 11155111,
      Blockconfirmation: 6,
    },
  },
};
