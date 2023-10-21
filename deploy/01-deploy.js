const { ethers } = require("hardhat");

let taxtoken, vendor;

module.exports = async function Deploy() {
  const [deployer, player2, treasury] = await ethers.getSigners();
  //deploy tax token
  const taxtokenFactory = await ethers.getContractFactory("TaxToken");
  taxtoken = await taxtokenFactory.deploy(treasury.address); //pass treasury address to constructor
  await taxtoken.deployed(deployer.address);

  //deploy vendor
  const VendorFactory = await ethers.getContractFactory("Vendor");
  vendor = await VendorFactory.deploy(taxtoken.address);
  await vendor.deployed();

  await taxtoken.transfer(vendor.address, ethers.utils.parseEther("1000")); //transfer token to vendor
  //await vendor.setFrontEndAddress(); //set front end address - not sure what this is for yet

  const tokenBalance = await taxtoken.balanceOf(vendor.address);
  console.log(`token Balance:- ${tokenBalance}`);
};

//Deploy.tags = ["all"];
