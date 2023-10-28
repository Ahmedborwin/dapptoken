const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const etherM = "1000000000000000000000000";

describe("Taxable Token Tests", () => {
  let taxtoken,
    deployerSigner,
    deployer,
    player2Signer,
    player2,
    treasurySigner,
    treasury,
    buyerSigner,
    buyer;
  beforeEach("deploy contract", async () => {
    //get signers and their address
    [deployerSigner, player2Signer, treasurySigner, buyerSigner] =
      await ethers.getSigners();

    deployer = deployerSigner.address;
    player2 = player2Signer.address;
    treasury = treasurySigner.address;
    buyer = buyerSigner.address;

    //initiate and deploy contract
    const taxTokenContract = await ethers.getContractFactory("TaxToken");
    taxtoken = await taxTokenContract.deploy(treasury); //feed treasury address to constructor
    await taxtoken.deployed();
  });

  //sending tokens
  //approving tokens
  //delelgated transfer
  //add events and test events
  //add custom error and test them

  describe("Deployment Token", () => {
    it("Checks tokens minted to deployer address", async () => {
      const tokenBalance = await taxtoken.balanceOf(deployer);
      const tokenBalanceString = tokenBalance.toString();
      console.log(
        `Tokens minted to deployer address: ${ethers.utils.formatEther(
          tokenBalanceString
        )} Ethers`
      );
      expect(ethers.utils.formatEther(tokenBalanceString)).equal(
        ethers.utils.formatUnits(etherM, "ether")
      );
    });
    it("checks totalSupply of tokens", async () => {
      const totalSupply = await taxtoken.getTotalSupply();
      expect(totalSupply).equal(tokens(1000000).toString());
    });
  });

  describe("check tax admin functions access control are in place", () => {
    it("only governer role can switch on the tax", async () => {
      //switch off tax
      await taxtoken.disableTax();
      // connect using player 2
      await expect(
        taxtoken.connect(player2Signer).enableTax() //attempt to switch on tax using account without governer role
      ).revertedWithCustomError(taxtoken, "AccessControlUnauthorizedAccount");
    });
    it("only governer role can switch off the tax", async () => {
      // connect using player 2
      await expect(
        taxtoken.connect(player2Signer).disableTax() //attempt to switch off tax using account without governer role
      ).revertedWithCustomError(taxtoken, "AccessControlUnauthorizedAccount");
    });
    it("only governer role can update tax percentage", async () => {
      // connect using player 2
      await expect(
        taxtoken.connect(player2Signer).updateTax(100)
      ).revertedWithCustomError(taxtoken, "AccessControlUnauthorizedAccount");
    });

    it("only president role can update tax percentage", async () => {
      // connect using player 2
      await expect(
        taxtoken.connect(player2Signer).updateTaxDestination(buyer) //assign different address for tax
      ).revertedWithCustomError(taxtoken, "AccessControlUnauthorizedAccount");
    });
  });

  describe("check transfer token amount follow expected logic", () => {
    it("checks deployer is exempt from Tax", async () => {
      //
      const transferAmount = tokens(10);

      await expect(
        taxtoken.transfer(buyer, transferAmount) //transfer tokens to account
      ).changeTokenBalances(
        taxtoken,
        [deployerSigner, buyerSigner, treasurySigner],
        [
          transferAmount.mul(-1),
          transferAmount.mul(1),
          0, // tax exempt transaction expected
        ]
      );
      //read treasury
      console.log(
        `Tokens received by Buyer: ${ethers.utils.formatEther(
          await taxtoken.balanceOf(buyer)
        )}`
      );
    });
    it("checks token Tax is sent to treasury", async () => {
      //
      const transferAmount = tokens(10);
      console.log("Begin transfer");
      //transfer tokens from deployer to user2
      await taxtoken.transfer(player2, transferAmount);
      //taxable transfer call
      await expect(
        taxtoken.connect(player2Signer).transfer(buyer, transferAmount) //connect to player2 and transfer tokens to buyer
      ).changeTokenBalances(
        taxtoken,
        [player2Signer, buyerSigner, treasurySigner],
        [
          transferAmount.mul(-1),
          transferAmount.mul(95).div(100),
          transferAmount.mul(5).div(100), //tax tokens
        ]
      );
      //read treasury
      console.log(
        "Treasury Balance:",
        ethers.utils.formatEther(await taxtoken.balanceOf(treasury), "\n")
      );
    });
  });
});
