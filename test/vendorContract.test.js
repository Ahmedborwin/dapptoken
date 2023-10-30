//import { time } from "@nomicfoundation/hardhat-network-helpers";

const { ethers } = require("hardhat");
const { expect } = require("chai");
const { add } = require("lodash");
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Vendor", () => {
  let vendor, deployer, buyer, taxtoken, treasury, totalSupply;
  beforeEach("deploy test contract", async () => {
    [deployer, treasury, taxtoken, buyer] = await ethers.getSigners();

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
  describe("Vendor Contract - Buy", () => {
    it("buyTokens", async () => {
      await vendor.connect(buyer).buyTokens({ value: tokens(1) });

      const balanceBuyer = await taxtoken.balanceOf(buyer.address);
      const balanceTreasury = await taxtoken.balanceOf(treasury.address);
      console.log(
        "buyer Address: ",
        buyer.address,
        "balance buyer",
        balanceBuyer.toString()
      );
      console.log("balance treasury", balanceTreasury.toString());
      const totalBalance = add(balanceBuyer, balanceTreasury).toString();
      expect(totalBalance).equal(tokens(40).toString());
    });
    it("buyTokens updates tokens bought variables", async () => {
      await vendor.connect(buyer).buyTokens({ value: tokens(1) });
      const tokensBought = await vendor.getTokensSold();
      expect(tokensBought).equal(tokens(40).toString());
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
  describe("Vendor Contract - Sell", () => {
    let tokensSold;
    beforeEach("buy tokens", async () => {
      await vendor.connect(buyer).buyTokens({ value: tokens(10) }); //buy tokens
      const tokenPrice = await vendor.getTokenPrice();
      //work out tokens bought by price
      const tokenBought = (tokens(10) / tokenPrice) * 1e18;
      //buyer approves vendor contract to spend tokens
      await taxtoken
        .connect(buyer)
        .approve(vendor.address, tokenBought.toString()); //users approves vendor before trying to sell
      tokensSold = await vendor.getTokensSold();
    });
    it("sellTokens", async () => {
      const tokenBalanceBuyer = await taxtoken.balanceOf(buyer.address);
      await vendor.connect(buyer).sellTokens(tokenBalanceBuyer); //buyer sells tokens
      //check token balance of vendor contract
      expect((await taxtoken.balanceOf(treasury.address)).toString()).equal(
        tokens(39)
      );
    });
    it("checks sell tokens updates tokens sold variable", async () => {
      const tokenBalanceBuyer = await taxtoken.balanceOf(buyer.address);
      await vendor.connect(buyer).sellTokens(tokenBalanceBuyer); //buyer sells tokens
      const tokensSold2 = await vendor.getTokensSold();
      expect(add(tokensSold2, tokenBalanceBuyer).toString()).equal(
        tokensSold.toString()
      );
    });
  });
  describe("Vendor Contract - Refund", () => {
    let tokensSold;
    beforeEach("buy tokens", async () => {
      await vendor.connect(buyer).buyTokens({ value: tokens(10) }); //buy tokens
      const tokenPrice = await vendor.getTokenPrice();
      //work out tokens bought by price
      const tokenBought = (tokens(10) / tokenPrice) * 1e18;
      //buyer approves vendor contract to spend tokens
      await taxtoken
        .connect(buyer)
        .approve(vendor.address, tokenBought.toString()); //users approves vendor before trying to sell
      tokensSold = await vendor.getTokensSold();
    });
    it("fails in 7 days not elapsed", async () => {
      const tokenBalanceBuyer = await taxtoken.balanceOf(buyer.address);
      expect(await vendor.connect(buyer).refundTokens()).revertedWith(
        "Crowdsale is Ongoing"
      ); //buyer sells tokens
      await ethers.sendTransaction({});
    });
    it("Allows buyer to refund all tokens", async () => {
      await ethers.provider.send("evm_increaseTime", [604800]);
      await ethers.provider.send("evm_mine");
      const tokenBalanceBuyer = await taxtoken.balanceOf(buyer.address);
      await vendor.connect(buyer).refundTokens(); //buyer sells tokens
      //check token balance of vendor contract
      expect((await taxtoken.balanceOf(treasury.address)).toString()).equal(
        tokens(39)
      );
    });
  });
});
