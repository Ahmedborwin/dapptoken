// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../contracts/Taxable.sol";

contract TaxToken is
    ERC20,
    ERC20Permit,
    ERC20Votes,
    Taxable,
    AccessControl,
    ReentrancyGuard
{
    //state fields

    address frontEndAddress = 0x0000000000000000000000000000000000000000;

    //securtiy roles
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE"); //sets the governor role
    bytes32 public constant PRESIDENT_ROLE = keccak256("PRESIDENT_ROLE"); //sets the president role
    bytes32 public constant EXCLUDED_ROLE = keccak256("EXCLUDED_ROLE"); //sets the excluded role

    constructor(
        address taxDestination
    ) ERC20("taxToken", "TT") ERC20Permit("taxToken") {
        //set roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(PRESIDENT_ROLE, msg.sender);
        _grantRole(EXCLUDED_ROLE, msg.sender);
        //tur tax on, set tax % and tax destination
        _taxon();
        _updatetax(500);
        updateTaxDestination(taxDestination);
        uint256 totalSupply = 1000000 ether;
        _mint(msg.sender, totalSupply);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    // Override transfer function for Taxation
    function _transfer(
        address from,
        address to,
        uint256 amount // Overrides the _update() function to use an optional transfer tax.
    )
        internal
        virtual
        override(
            ERC20 // Specifies ERC20 contract for the override.
        )
        nonReentrant // Prevents re-entrancy attacks.
    {
        if (
            hasRole(EXCLUDED_ROLE, from) ||
            hasRole(EXCLUDED_ROLE, to) ||
            !taxed()
        ) {
            // If to/from a tax excluded address or if tax is off...
            super._transfer(from, to, amount); // Transfers 100% of amount to recipient.
        } else {
            // If not to/from a tax excluded address & tax is on...
            require(
                balanceOf(from) >= amount,
                "ERC20: transfer amount exceeds balance"
            ); // Makes sure sender has the required token amount for the total.
            // If the above requirement is not met, then it is possible that the sender could pay the tax but not the recipient, which is bad...
            super._transfer(
                from,
                taxdestination(),
                (amount * thetax()) / 10000
            ); // Transfers tax to the tax destination address.
            super._transfer(from, to, (amount * (10000 - thetax())) / 10000); // Transfers the remainder to the recipient.
        }
    }

    //setup functions

    function setFrontEndAddress(
        address _frontEndAddress
    ) external onlyRole(GOVERNOR_ROLE) {
        frontEndAddress = _frontEndAddress;
    }

    // TAX ADMIN FUNCTIONS

    function enableTax() public onlyRole(GOVERNOR_ROLE) {
        _taxon();
    }

    function disableTax() public onlyRole(GOVERNOR_ROLE) {
        _taxoff();
    }

    function updateTax(uint newtax) public onlyRole(GOVERNOR_ROLE) {
        _updatetax(newtax);
    }

    function updateTaxDestination(
        address newdestination
    ) public onlyRole(PRESIDENT_ROLE) {
        _updatetaxdestination(newdestination);
    }
}
