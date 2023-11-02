// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../contracts/TaxToken.sol"; // Make sure to import your TaxToken contract properly

contract Vendor is Ownable {
    event tokensBought(address buyer, uint256 tokenBought);

    TaxToken private taxToken;

    uint256 public constant tokenPerEth = 0.025 ether;
    uint256 internal crowdsaleDeadline;
    uint256 internal tokensSold;
    address internal taxableTokenOwner;

    constructor(
        address _taxTokenAddress,
        address _taxableTokenOwner
    ) Ownable(msg.sender) {
        taxToken = TaxToken(_taxTokenAddress);
        taxableTokenOwner = _taxableTokenOwner;
        crowdsaleDeadline = block.timestamp + 604800;
    }

    // Buy function
    function buyTokens() public payable {
        uint256 tokensToBuy = (msg.value / tokenPerEth) * 1e18;

        // Transfer tokens to the buyer
        require(
            taxToken.transferFrom(taxableTokenOwner, msg.sender, tokensToBuy),
            "Token transfer failed"
        );

        tokensSold += tokensToBuy;

        emit tokensBought(msg.sender, tokensToBuy);
    }

    function refundTokens() external {
        require(block.timestamp >= crowdsaleDeadline, "Crowdsale is Ongoing");

        uint256 tokenAmount = taxToken.balanceOf(msg.sender); //get total tokens owned by caller

        //calculate ethers owed to token seller
        uint256 ethForTokensSold = (tokenAmount * tokenPerEth) / 1e18;

        // Check if the contract has enough Ether to buy back the tokens
        require(
            address(this).balance >= ethForTokensSold,
            "Not enough Ether in contract"
        );

        //taxToken.disableTax(); //disable tax for refund transaction

        // Transfer tokens from the seller to owner contract
        require(
            taxToken.transferFrom(msg.sender, owner(), tokenAmount),
            "Token transfer failed"
        );

        // Transfer Ether to the seller
        (bool sent, ) = payable(msg.sender).call{value: ethForTokensSold}("");
        require(sent, "Transaction Failed");

        tokensSold -= tokenAmount;
    }

    // Sell function
    function sellTokens(uint256 tokenAmount) external {
        //min 5% of tokens to be bought
        require(crowdsaleThresholdPassed(), "Minimum Tokens not bought");

        //calculate ethers owed to token seller
        uint256 ethForTokensSold = (tokenAmount * tokenPerEth) / 1e18;

        // Check if the contract has enough Ether to buy back the tokens
        require(
            address(this).balance >= ethForTokensSold,
            "Not enough Ether in contract"
        );

        // Check if the sender has enough tokens to sell
        require(
            taxToken.balanceOf(msg.sender) >= tokenAmount,
            "Not enough tokens to sell"
        );

        // Transfer tokens from the seller to owner contract
        require(
            taxToken.transferFrom(msg.sender, owner(), tokenAmount),
            "Token transfer failed"
        );

        // Transfer Ether to the seller
        (bool sent, ) = payable(msg.sender).call{value: ethForTokensSold}("");
        require(sent, "Transaction Failed");

        tokensSold -= tokenAmount;
    }

    // Owner can deposit tokens into the contract
    function depositTokens(uint256 tokenAmount) external onlyOwner {
        require(
            taxToken.transferFrom(msg.sender, taxableTokenOwner, tokenAmount),
            "Token transfer failed"
        );
    }

    // Owner can withdraw all Ether from the contract
    function withdrawBalance() external onlyOwner {
        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(sent, "Transaction failed!");
    }

    function crowdsaleThresholdPassed() internal returns (bool) {
        //get total supply
        uint256 totalTokens = taxToken.getTotalSupply();
        uint256 tokenSoldAsBasis = (((tokensSold / totalTokens) * 7500) /
            10000);
        console.log("token solds as Basis points: ", tokenSoldAsBasis);
        if (tokenSoldAsBasis > 7500) {
            return true;
        } else {
            return false;
        }
    }

    // Get token price
    function getTokenPrice() external pure returns (uint256) {
        return tokenPerEth;
    }

    function getTokensSold() external view returns (uint256) {
        return tokensSold;
    }

    receive() external payable {
        buyTokens();
    }

    fallback() external payable {
        console.log("<<<<<<<<<<YOU HIT THE FALL BACK>>>>>>>>>");
    }
}
