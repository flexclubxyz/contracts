// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title TheFalseNine
 * @notice A simple, fixed-supply ERC20 token with optional burn and vote functionality.
 */
contract TheFalseNine is
    ERC20,
    ERC20Burnable,
    ERC20Permit,
    ERC20Votes,
    Ownable
{
    /**
     * @dev Token name and symbol constants
     */
    string public constant TOKEN_NAME = "THE FALSE NINE";
    string public constant TOKEN_SYMBOL = "TFN";

    /**
     * @dev Total supply of 1,000,000,000 tokens
     */
    uint256 public constant TOKEN_INITIAL_SUPPLY = 1_000_000_000;

    /**
     * @notice Deploy with a fixed supply minted to the deployer (owner).
     */
    constructor() 
        ERC20(TOKEN_NAME, TOKEN_SYMBOL)
        ERC20Permit(TOKEN_NAME)
        Ownable(msg.sender)
    {
        // Mint the full supply to the deployer
        _mint(_msgSender(), TOKEN_INITIAL_SUPPLY * 10 ** decimals());
    }

    /**
     * @dev Combine updates from ERC20, ERC20Pausable, and ERC20Votes
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    /**
     * @dev Combine nonces from ERC20Permit and ERC20Votes
     */
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
