const { ethers } = require("hardhat");

let taxtoken, vendor;

async function Deploy() {
  const [deployer, treasury, user1] = await ethers.getSigners();

  //deploy tax token
  const taxtokenFactory = await ethers.getContractFactory("TaxToken");
  taxtoken = await taxtokenFactory.deploy(treasury.address); //pass treasury address to constructor
  await taxtoken.deployed(deployer.address);

  //deploy vendor
  const VendorFactory = await ethers.getContractFactory("Vendor");
  vendor = await VendorFactory.deploy(taxtoken.address, deployer.address);
  await vendor.deployed();

  const totalSupply = await taxtoken.totalSupply();

  await taxtoken.approve(vendor.address, totalSupply.toString()); //transfer token to vendor

  const tokenAllowance = ethers.utils.formatEther(
    await taxtoken.allowance(deployer.address, vendor.address)
  );

  console.log(`token allowance:- ${tokenAllowance}`);
}

//Deploy.tags = ["all"];
Deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
