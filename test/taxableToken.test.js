const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const etherM = "1000000000000000000000000";

describe("Taxable token", () => {
  let taxtoken, deployerSigner, deployer, player2Signer, player2;
  beforeEach("deploy contract", async () => {
    //get signers and their address
    [deployerSigner, player2Signer] = await ethers.getSigners();
    deployer = deployerSigner.address;

    player2 = player2Signer.address;

    //initiate and deploy contract
    const taxTokenContract = await ethers.getContractFactory("TaxToken");
    taxtoken = await taxTokenContract.deploy();
    await taxtoken.deployed();
  });

  it("Checks tokens minted", async () => {
    const tokenBalance = await taxtoken.balanceOf(deployer);
    const tokenBalanceString = tokenBalance.toString();
    console.log(`${ethers.utils.formatEther(tokenBalanceString)} Ethers`);
    expect(ethers.utils.formatEther(tokenBalanceString)).equal(
      ethers.utils.formatUnits(etherM, "ether")
    );
    taxtoken.transfer();
  });

  it("Check beforeTokentransfer works", async () => {
    //how can i get token transfer to work??
    taxtoken.transfer();
  });
  it("collect tax on token Transfer", async () => {
    //how can i get token transfer to work??
    taxtoken.transfer();
  });
});
