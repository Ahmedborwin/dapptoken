const { ethers } = require("hardhat");
const { expect } = require("chai");
const { add } = require("lodash");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Vendor", () => {
  let vendor, deployer, buyer, taxtoken, treasury, totalSupply;
  beforeEach("deploy test contract", async () => {
    [deployer, buyer, taxtoken, treasury] = await ethers.getSigners();

    //deploy tax token
    const taxtokenFactory = await ethers.getContractFactory("TaxToken");
    taxtoken = await taxtokenFactory.deploy(treasury.address); //pass treasury address to constructor
    await taxtoken.deployed(deployer.address);

    //deploy vendor
    const VendorFactory = await ethers.getContractFactory("Vendor");
    vendor = await VendorFactory.deploy(taxtoken.address, deployer.address);

    await vendor.deployed();

    totalSupply = await taxtoken.totalSupply();

    // approve vendor to transfer tokens
    await taxtoken.approve(vendor.address, totalSupply);
  });

  describe("deployment", () => {
    it("Price of token in Eth", async () => {
      const tokenPrice = ethers.utils.formatEther(await vendor.getTokenPrice());
      expect(tokenPrice).equal("0.025");
    });
    it("Check vendor token allowance", async () => {
      const tokenAllowance = await taxtoken.allowance(
        deployer.address,
        vendor.address
      );
      expect(tokenAllowance.toString()).equal(totalSupply.toString());
    });
  });
  describe("buy", () => {
    it("buyTokens", async () => {
      await vendor.connect(buyer).buyTokens({ value: tokens(1) });

      const balanceBuyer = await taxtoken.balanceOf(buyer.address);
      const balanceTreasury = await taxtoken.balanceOf(treasury.address);
      console.log("balance buyer", balanceBuyer.toString());
      console.log("balance treasury", balanceTreasury.toString());
      const totalBalance = add(balanceBuyer, balanceTreasury).toString();
      expect(totalBalance).equal(tokens(40).toString());
    });

    it("buy tokens event emitted", async () => {
      expect(await vendor.connect(buyer).buyTokens({ value: tokens(1) }))
        .emit(vendor, "tokenBought")
        .withArgs(buyer.address, tokens(40));
    });

    it("send ether to contract will buy tokens", async () => {
      await buyer.sendTransaction({ to: vendor.address, value: tokens(1) });
      const balanceBuyer = await taxtoken.balanceOf(buyer.address);
      const balanceTreasury = await taxtoken.balanceOf(treasury.address);
      const totalBalance = add(balanceBuyer, balanceTreasury).toString();
      expect(totalBalance).equal(tokens(40).toString());
    });
  });
  describe("Sell", () => {
    it("sellTokens", async () => {
      await vendor.connect(buyer).buyTokens({ value: tokens(10) }); //buy tokens

      await taxtoken.connect(buyer).approve(vendor.address, tokens(1000)); //users approves vendor before trying to sell

      const tokenBalanceBuyer = await taxtoken.balanceOf(buyer.address);

      await vendor.connect(buyer).sellTokens(tokenBalanceBuyer); //buyer sells tokens

      //check token balance of vendor contract
      expect((await taxtoken.balanceOf(treasury.address)).toString()).equal(
        tokens(39)
      );

      //check eth balance of seller
      //not sure how to check that ether increases by 1 ether after selling tokens..

      const ethBalanceAfter = await ethers.provider.getBalance(buyer.address);
      // console.log("ethBalanceAfter", ethers.utils.formatEther(ethBalanceAfter));
    });
    // it("should handle random value for sellTokens", async function () {

    //   const randomValue = Math.floor(Math.random() * 1000000);
    //   // await taxtoken.approve(vendor.address, randomValue);
    //   await vendor.sellTokens(randomValue);
    //   const sellerBalance = await taxtoken.balanceOf(deployer.address);
    //   expect(Number(sellerBalance)).least(0);
    // });
  });
});
