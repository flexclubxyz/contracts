// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FlexClub004 is ReentrancyGuard {
    struct Goal {
        string name;
        string description;
        uint256 pooled;
        uint256 target;
        uint256 deadline;
        uint256 contributors;
    }

    mapping(address => uint256) public balances;
    mapping(address => bool) private hasContributed;
    Goal public goal;
    address public donationWallet;
    bool public fundsWithdrawn;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);
    event GoalInfoUpdated(
        string name,
        string description,
        uint256 pooled,
        uint256 target,
        uint256 deadline,
        uint256 contributors
    );

    constructor(
        address _donationWallet,
        uint256 _deadline,
        string memory _goalName,
        string memory _goalDescription,
        uint256 _targetAmount
    ) {
        require(_donationWallet != address(0), "Invalid donation wallet address");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        donationWallet = _donationWallet;
        goal = Goal(_goalName, _goalDescription, 0, _targetAmount, _deadline, 0);
        fundsWithdrawn = false;
    }

    receive() external payable {
        _processDeposit();
    }

    function deposit() public payable {
        _processDeposit();
    }

    function _processDeposit() private nonReentrant {
        require(block.timestamp < goal.deadline, "The deadline has passed");
        require(msg.value > 0, "Deposit amount must be greater than zero");
        require(!fundsWithdrawn, "Funds have already been withdrawn");

        balances[msg.sender] += msg.value;
        goal.pooled += msg.value;

        // Update unique contributor count
        if (!hasContributed[msg.sender]) {
            hasContributed[msg.sender] = true;
            goal.contributors += 1;
        }

        emit Deposit(msg.sender, msg.value);
        emit GoalInfoUpdated(
            goal.name,
            goal.description,
            goal.pooled,
            goal.target,
            goal.deadline,
            goal.contributors
        );
    }

    function withdraw() public nonReentrant {
        require(msg.sender == donationWallet, "Only the donation wallet can withdraw");
        require(
            block.timestamp >= goal.deadline || goal.pooled >= goal.target,
            "Cannot withdraw before deadline or target is reached"
        );
        require(!fundsWithdrawn, "Funds have already been withdrawn");
        require(goal.pooled > 0, "No funds to withdraw");

        fundsWithdrawn = true;
        uint256 amount = address(this).balance;

        // Transfer the pooled ETH to the donation wallet
        (bool success, ) = donationWallet.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawal(donationWallet, amount);
        emit GoalInfoUpdated(
            goal.name,
            goal.description,
            0, // Reset pooled amount to zero
            goal.target,
            goal.deadline,
            goal.contributors
        );
    }

    /**
     * @notice Allows users to refund their contribution and withdraw their deposited amount
     *         provided the donation wallet hasn't withdrawn the funds yet.
     */
    function refund() public nonReentrant {
        require(!fundsWithdrawn, "Funds have already been withdrawn");
        uint256 userBalance = balances[msg.sender];
        require(userBalance > 0, "No balance to withdraw");

        // Update state before transferring to prevent reentrancy attacks
        balances[msg.sender] = 0;
        goal.pooled -= userBalance;

        // Transfer the user's ETH back
        (bool success, ) = msg.sender.call{value: userBalance}("");
        require(success, "Transfer failed");

        emit Withdrawal(msg.sender, userBalance);
        emit GoalInfoUpdated(
            goal.name,
            goal.description,
            goal.pooled,
            goal.target,
            goal.deadline,
            goal.contributors
        );
    }

    function getGoalInfo()
        public
        view
        returns (
            string memory name,
            string memory description,
            uint256 pooled,
            uint256 target,
            uint256 deadline,
            uint256 contributors
        )
    {
        return (
            goal.name,
            goal.description,
            goal.pooled,
            goal.target,
            goal.deadline,
            goal.contributors
        );
    }
}