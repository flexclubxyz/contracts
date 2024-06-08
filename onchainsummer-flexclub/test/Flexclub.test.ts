import { expect } from "chai";
import { ethers, deployments, getNamedAccounts } from "hardhat";
import { FlexClub } from "../typechain/FlexClub";

describe("FlexClub", function () {
  let flexClub: FlexClub;
  let deployer: string;
  let user: any;

  beforeEach(async function () {
    await deployments.fixture(["FlexClub", "MockERC20"]);
    const { deployer: deployerAddress } = await getNamedAccounts();
    deployer = deployerAddress;
    [user] = await ethers.getSigners();

    const FlexClubDeployment = await deployments.get("FlexClub");
    flexClub = (await ethers.getContractAt(
      "FlexClub",
      FlexClubDeployment.address
    )) as FlexClub;

    const MockUSDCDeployment = await deployments.get("MockERC20");
    mockUSDC = (await ethers.getContractAt(
      "MockERC20",
      MockUSDCDeployment.address
    )) as MockERC20;
  });

  it("should deploy and allow deposits and withdrawals", async function () {
    const depositAmount = ethers.parseUnits("100", 6); // 100 USDC

    // Mint USDC to user
    await mockUSDC.connect(deployer).mint(user.address, depositAmount);
    await mockUSDC.connect(user).approve(flexClub.address, depositAmount);

    await flexClub
      .connect(user)
      .deposit(depositAmount, "Goal 1", "Goal Description", 1000, 1711814400);

    expect(await flexClub.balances(user.address)).to.equal(depositAmount);

    const goalInfo = await flexClub.getGoalInfo(0);
    expect(goalInfo.name).to.equal("Goal 1");

    await flexClub.connect(user).withdraw(depositAmount);
    expect(await flexClub.balances(user.address)).to.equal(0);
  });
});
