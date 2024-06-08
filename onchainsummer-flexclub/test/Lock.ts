import { expect } from "chai";
import { ethers, deployments } from "hardhat";

// A helper utility to get the timestamp.
import { time } from "@nomicfoundation/hardhat-network-helpers";

// We import this type to have our signers typed.
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

// Types from typechain
import { Lock__factory, Lock } from "../typechain-types";

describe("Lock", function () {
  // This represents the time in the future we expect to release the funds locked.
  const UNLOCK_TIME = 10000;

  // The amount of ether we plan to lock.
  const VALUE_LOCKED = ethers.utils.parseEther("0.01");

  // This variable will store the last block timestamp.
  let lastBlockTimeStamp: number;

  // Typechain allow us to type an instance of the Lock contract.
  let lockInstance: Lock;

  // This is the Signer of the owner.
  let ownerSigner: SignerWithAddress;

  // A non owner signed is useful to test non owner transactions.
  let otherUserSigner: SignerWithAddress;

  before(async () => {
    // We get the latest block.timestamp using the latest function of time.
    lastBlockTimeStamp = await time.latest();

    // Hardhat provide us with some sample signers that simulate Ethereum accounts.
    const signers = await ethers.getSigners();

    // We simply assign the first signer to ownerSigner
    ownerSigner = signers[0];

    // We assign the second signer to otherUserSigner
    otherUserSigner = signers[1];

    await deployments.fixture(["DeployAll"]);
    const lockDeployment = await deployments.get("Lock");

    lockInstance = Lock__factory.connect(lockDeployment.address, ownerSigner);
  });

  it("should get the unlockTime value", async () => {
    // we get the value from the contract
    const unlockTime = await lockInstance.unlockTime();

    // We assert against the
    expect(unlockTime).to.equal(lastBlockTimeStamp + UNLOCK_TIME);
  });

  it("should have the right ether balance", async () => {
    // Get the Lock contract address
    const lockInstanceAddress = await lockInstance.getAddress();

    // Get the balance using ethers.provider.getBalance
    const contractBalance = await ethers.provider.getBalance(
      lockInstanceAddress
    );

    // We assert the balance against the VALUE_LOCKED we initially sent
    expect(contractBalance).to.equal(VALUE_LOCKED);
  });

  it("should have the right owner", async () => {
    // Notice ownerSigned has an address property
    expect(await lockInstance.owner()).to.equal(ownerSigner.address);
  });

  it('shouldn"t allow to withdraw before unlock time', async () => {
    await expect(lockInstance.withdraw()).to.be.revertedWith(
      "You can't withdraw yet"
    );
  });

  it('shouldn"t allow to withdraw a non owner', async () => {
    const newLastBlockTimeStamp = await time.latest();

    // We set the next block time stamp using this helper.
    // We assign a value further in the future.
    await time.setNextBlockTimestamp(newLastBlockTimeStamp + UNLOCK_TIME);

    // Then we try to withdraw using other user signer. Notice the .connect function that is useful
    //  to create and instance but have the msg.sender as the new signer.
    const newInstanceUsingAnotherSigner = lockInstance.connect(otherUserSigner);

    // We attempt to withdraw, but since the sender is not the owner, it will revert.
    await expect(newInstanceUsingAnotherSigner.withdraw()).to.be.revertedWith(
      "You aren't the owner"
    );
  });

  it("should allow to withdraw a owner", async () => {
    const balanceBefore = await ethers.provider.getBalance(
      await lockInstance.getAddress()
    );

    // Its value will be the one we lock at deployment time.
    expect(balanceBefore).to.equal(VALUE_LOCKED);

    const newLastBlockTimeStamp = await time.latest();

    // We increase time
    await time.setNextBlockTimestamp(newLastBlockTimeStamp + UNLOCK_TIME);

    // Attempt to withdraw
    await lockInstance.withdraw();

    // Get new balance and assert that is 0
    const balanceAfter = await ethers.provider.getBalance(
      await lockInstance.getAddress()
    );
    expect(balanceAfter).to.equal(0);
  });
});
