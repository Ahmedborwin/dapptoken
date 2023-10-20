// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../contracts/TaxToken.sol"; // Make sure to import your TaxToken contract properly

contract Vendor is Ownable {
    TaxToken private taxToken;
    uint256 constant tokenPerEth = 1000000; // 1 * 10 ** 6

    constructor(address _taxTokenAddress) Ownable(msg.sender) {
        taxToken = TaxToken(_taxTokenAddress);
    }

    // Buy function
    function buyTokens() external payable {
        uint256 tokensToBuy = msg.value * tokenPerEth;

        // Transfer tokens to the buyer
        require(
            taxToken.transferFrom(owner(), msg.sender, tokensToBuy),
            "Token transfer failed"
        );
    }

    // Sell function
    function sellTokens(uint256 tokenAmount) external {
        uint256 ethForTokensSold = tokenAmount / tokenPerEth;

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

        // Transfer tokens from the seller to this contract
        require(
            taxToken.transferFrom(msg.sender, address(this), tokenAmount),
            "Token transfer failed"
        );

        // Transfer Ether to the seller
        (bool sent, ) = payable(msg.sender).call{value: ethForTokensSold}("");
        require(sent, "Transaction Failed");
    }

    // Owner can deposit tokens into the contract
    function depositTokens(uint256 tokenAmount) external onlyOwner {
        require(
            taxToken.transferFrom(msg.sender, address(this), tokenAmount),
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

    // Get token price
    function getTokenPrice() external pure returns (uint256) {
        return tokenPerEth;
    }

    receive() external payable {}
}
