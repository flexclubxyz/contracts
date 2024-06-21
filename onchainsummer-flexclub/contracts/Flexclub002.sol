// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract FlexClub002 is ReentrancyGuard {
    struct Goal {
        string name;
        string goal;
        uint256 pooled;
        uint256 target;
        uint256 deadline;
        uint256 flexers;
        uint256 pooledWithInterest;
    }

    mapping(address => uint256) public balanceWithoutInterest;
    mapping(address => bool) private hasDeposited;
    Goal public goal;
    address public usdcTokenAddress;
    IPoolAddressesProvider public provider;
    IERC20 public aToken;
    uint256 public initialATokenBalance;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event GoalInfoUpdated(string name, string goal, uint256 pooled, uint256 target, uint256 deadline, uint256 flexers, uint256 pooledWithInterest);

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
        goal = Goal(goalName, goalDescription, 0, targetAmount, _deadline, 0, 0);
        aToken = IERC20(_aTokenAddress);
    }

    function deposit(uint256 amount) public nonReentrant {
        require(block.timestamp < goal.deadline, "The deadline has passed.");
        IERC20(usdcTokenAddress).transferFrom(msg.sender, address(this), amount);
        balanceWithoutInterest[msg.sender] += amount;
        goal.pooled += amount;

        // Update unique depositor count
        if (!hasDeposited[msg.sender]) {
            hasDeposited[msg.sender] = true;
            goal.flexers += 1;
        }

        // Integrate with Aave
        IPool lendingPool = IPool(provider.getPool());
        IERC20(usdcTokenAddress).approve(address(lendingPool), amount);
        lendingPool.supply(usdcTokenAddress, amount, address(this), 0);

        // Update pooledWithInterest
        goal.pooledWithInterest = aToken.balanceOf(address(this));

        emit Deposit(msg.sender, amount);
        emit GoalInfoUpdated(goal.name, goal.goal, goal.pooled, goal.target, goal.deadline, goal.flexers, goal.pooledWithInterest);
    }

    function withdraw(uint256 amount) public nonReentrant {
        uint256 effectiveBalance = getEffectiveBalance(msg.sender);
        require(effectiveBalance >= amount, "Insufficient balance");

        // Withdraw from Aave
        IPool lendingPool = IPool(provider.getPool());
        lendingPool.withdraw(usdcTokenAddress, amount, address(this));

        IERC20(usdcTokenAddress).transfer(msg.sender, amount);
        balanceWithoutInterest[msg.sender] = effectiveBalance - amount;
        goal.pooled -= amount;

        // Update pooledWithInterest
        goal.pooledWithInterest = aToken.balanceOf(address(this));

        // Update initial aToken balance after withdrawal
        if (goal.pooled == 0) {
            initialATokenBalance = 0;
        }

        emit Withdrawal(msg.sender, amount);
        emit GoalInfoUpdated(goal.name, goal.goal, goal.pooled, goal.target, goal.deadline, goal.flexers, goal.pooledWithInterest);
    }

    function getGoalInfo() public view returns (string memory, string memory, uint256, uint256, uint256, uint256, uint256) {
        return (goal.name, goal.goal, goal.pooled, goal.target, goal.deadline, goal.flexers, goal.pooledWithInterest);
    }

    function checkInterestEarned() public view returns (uint256) {
        return aToken.balanceOf(address(this));
    }

    function getEffectiveBalance(address user) public view returns (uint256) {
        uint256 userShare = (balanceWithoutInterest[user] * aToken.balanceOf(address(this))) / goal.pooled;
        return userShare;
    }
}
