// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract FlexClub {
    struct Goal {
        string name;
        string goal;
        uint256 pooled;
        uint256 target;
        uint256 deadline;
        uint256 flexers;
    }

    mapping(address => uint256) public balances;
    mapping(address => Goal) public userGoals;
    Goal[] public goals;
    address public usdcTokenAddress;
    IPoolAddressesProvider public provider;

    constructor(address _usdcTokenAddress, address _provider) {
        usdcTokenAddress = _usdcTokenAddress;
        provider = IPoolAddressesProvider(_provider);
    }

    function deposit(uint256 amount, string memory goalName, string memory goalDescription, uint256 target, uint256 deadline) public {
        IERC20(usdcTokenAddress).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;

        // Integrate with Aave
        IPool lendingPool = IPool(provider.getPool());
        IERC20(usdcTokenAddress).approve(address(lendingPool), amount);
        lendingPool.supply(usdcTokenAddress, amount, address(this), 0);

        // Create or update goal
        Goal storage goal = userGoals[msg.sender];
        if (goal.target == 0) {
            goals.push(Goal(goalName, goalDescription, amount, target, deadline, 1));
        } else {
            goal.pooled += amount;
            goal.flexers += 1;
        }
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Withdraw from Aave
        IPool lendingPool = IPool(provider.getPool());
        lendingPool.withdraw(usdcTokenAddress, amount, address(this));

        IERC20(usdcTokenAddress).transfer(msg.sender, amount);
        balances[msg.sender] -= amount;
    }

    function getGoalInfo(uint256 index) public view returns (string memory, string memory, uint256, uint256, uint256, uint256) {
        Goal memory goal = goals[index];
        return (goal.name, goal.goal, goal.pooled, goal.target, goal.deadline, goal.flexers);
    }
}
