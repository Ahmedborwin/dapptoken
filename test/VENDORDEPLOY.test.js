const { ethers } = require("hardhat");
const { expect } = require("chai");
const { add } = require("lodash");
const Deploy = require("../deploy/01-deploy");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function triggerDeploy() {
  try {
    await Deploy();
  } catch (error) {
    console.error("Error during deployment:", error);
  }
}

describe("vendor Contract Tests Deployscript", () => {
  let vendor, deployer, buyer, taxtoken, treasury;
  beforeEach("deploy test contract", async () => {
    [deployer, buyer, taxtoken, treasury] = await ethers.getSigners();
    //call deploy script for taxToken and vendor contract:
    await triggerDeploy();
    vendor = await ethers.getContractAt("Vendor", deployer.address);
    taxtoken = await ethers.getContractAt("TaxToken", deployer.address);
  });
  it("Price of token in Eth", async () => {
    const tokenPrice = ethers.utils.formatEther(await vendor.getTokenPrice());
    expect(tokenPrice).equal("0.000000000001");
  });
  it("Check vendor token allowance", async () => {
    const tokenAllowance = await taxtoken.allowance(
      deployer.address,
      vendor.address
    );
    expect(tokenAllowance.toString()).equal(tokens(500000));
  });
  it("buyTokens", async () => {
    await vendor.connect(buyer).buyTokens({ value: "1" });
    const balanceBuyer = await taxtoken.balanceOf(buyer.address);
    const balanceTreasury = await taxtoken.balanceOf(treasury.address);

    expect(add(balanceBuyer, balanceTreasury)).equal(1000000);
  });
  it("sellTokens", async () => {
    await vendor.connect(buyer).buyTokens({ value: "1" }); //buy tokens
    await taxtoken.connect(buyer).approve(vendor.address, 100000); //users approves vendor before trying to sell
    await vendor.connect(buyer).sellTokens(100000); //buyer sells tokens
    //check token balance of vendor contract
    expect(await taxtoken.balanceOf(vendor.address)).equal(95000);
    //check eth balance of seller
  });
  it("should handle random value for sellTokens", async function () {
    const randomValue = Math.floor(Math.random() * 500000);
    await taxtoken.approve(vendor.address, randomValue);
    await vendor.sellTokens(randomValue);
    const sellerBalance = await taxtoken.balanceOf(deployer.address);
    expect(Number(sellerBalance)).least(0);
  });
});
