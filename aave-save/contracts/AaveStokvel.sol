// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";

contract AaveStokvel {
    address payable public owner;

    IERC20 private usdc;
    address usdcAddress;
    mapping(address => uint256) public usdcBalances;

    IPool aaveInstance;

    constructor(address _addressProvider, address _usdcAddress) {
        owner = payable(msg.sender);
        usdc = IERC20(_usdcAddress);
        usdcAddress = _usdcAddress;

        aaveInstance = IPool(_addressProvider);
    }

    function depositUSDC(uint256 _amount) public {
        usdcBalances[msg.sender] += _amount;
        uint256 allowance = usdc.allowance(msg.sender, address(this));
        require(allowance >= _amount, "Check the token allowance");
        usdc.transferFrom(msg.sender, address(this), _amount);

        aaveInstance.supply(usdcAddress, _amount, address(this), 0);
    }

    function getBalance() public view returns (uint256) {
        return IERC20(usdcAddress).balanceOf(address(this));
    }

    function getUserUSDCBalance(
        address _userAddress
    ) public view returns (uint256) {
        return usdcBalances[_userAddress];
    }
}
