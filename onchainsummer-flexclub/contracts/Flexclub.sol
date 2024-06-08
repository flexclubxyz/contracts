// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract FlexClub is ReentrancyGuard {
    struct Goal {
        string name;
        string goal;
        uint256 pooled;
        uint256 target;
        uint256 deadline;
        uint256 flexers;
    }

    mapping(address => uint256) public balances;
    Goal public goal;
    address public usdcTokenAddress;
    IPoolAddressesProvider public provider;
    IERC20 public aToken;
    uint256 public initialATokenBalance;

    constructor(
        address _usdcTokenAddress,
        address _provider,
        uint256 _deadline,
        string memory goalName,
        string memory goalDescription,
        uint256 targetAmount,
        address _aTokenAddress
    ) {
        usdcTokenAddress = _usdcTokenAddress;
        provider = IPoolAddressesProvider(_provider);
        goal = Goal(goalName, goalDescription, 0, targetAmount, _deadline, 0);
        aToken = IERC20(_aTokenAddress);
    }

    function deposit(uint256 amount) public nonReentrant {
        require(block.timestamp < goal.deadline, "The deadline has passed.");
        IERC20(usdcTokenAddress).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        goal.pooled += amount;
        goal.flexers += 1;

        // Integrate with Aave
        IPool lendingPool = IPool(provider.getPool());
        IERC20(usdcTokenAddress).approve(address(lendingPool), amount);
        lendingPool.supply(usdcTokenAddress, amount, address(this), 0);

        // Store initial aToken balance after deposit
        if (initialATokenBalance == 0) {
            initialATokenBalance = aToken.balanceOf(address(this));
        }
    }

    function withdraw(uint256 amount) public nonReentrant {
        uint256 effectiveBalance = getEffectiveBalance(msg.sender);
        require(effectiveBalance >= amount, "Insufficient balance");

        // Withdraw from Aave
        IPool lendingPool = IPool(provider.getPool());
        lendingPool.withdraw(usdcTokenAddress, amount, address(this));

        IERC20(usdcTokenAddress).transfer(msg.sender, amount);
        balances[msg.sender] = effectiveBalance - amount;
        goal.pooled -= amount;

        // Update initial aToken balance after withdrawal
        if (goal.pooled == 0) {
            initialATokenBalance = 0;
        }
    }

    function getGoalInfo() public view returns (string memory, string memory, uint256, uint256, uint256, uint256) {
        return (goal.name, goal.goal, goal.pooled, goal.target, goal.deadline, goal.flexers);
    }

    function checkInterestEarned() public view returns (uint256) {
        return aToken.balanceOf(address(this));
    }

    function calculateInterestEarned() public view returns (uint256) {
        uint256 currentATokenBalance = aToken.balanceOf(address(this));
        return currentATokenBalance > initialATokenBalance ? currentATokenBalance - initialATokenBalance : 0;
    }

    function getEffectiveBalance(address user) public view returns (uint256) {
        uint256 userShare = (balances[user] * aToken.balanceOf(address(this))) / goal.pooled;
        return userShare;
    }
}
