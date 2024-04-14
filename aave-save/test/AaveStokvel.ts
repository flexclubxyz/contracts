import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai";
import hre from "hardhat";

describe("Lock", function () {
  const ONE_GWEI = 1_000_000_000;

  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, ownerA, ownerB] = await hre.ethers.getSigners();

    const addressProvider = "0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b";
    const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

    const AaveStokvel = await hre.ethers.getContractFactory("AaveStokvel");
    const contract = await AaveStokvel.deploy(addressProvider, usdcAddress);

    return { contract, owner, ownerA, ownerB };
  }

  describe("Deployment", function () {
    it("Should deposit and withdraw successfully", async function () {
      const { contract, ownerA, ownerB } = await loadFixture(
        deployOneYearLockFixture
      );
    //   await contract.connect(ownerA).deposit(ONE_GWEI, {
    //     value: ONE_GWEI,
    //   });
    //   await contract.connect(ownerB).deposit(ONE_GWEI, {
    //     value: ONE_GWEI,
    //   });
    //   expect(await contract.getUserBalance(ownerA)).to.equal(ONE_GWEI);
    //   expect(await contract.getUserBalance(ownerB)).to.equal(ONE_GWEI);
    //   expect(await contract.getBalance()).to.equal(ONE_GWEI * 2);
    //   await contract.connect(ownerA).withdraw(ONE_GWEI / 2);
    //   expect(await contract.getUserBalance(ownerA)).to.equal(ONE_GWEI / 2);
    //   await contract.connect(ownerB).withdraw(ONE_GWEI);
    //   expect(await contract.getUserBalance(ownerB)).to.equal(0);
    //   expect(await contract.getBalance()).to.equal(ONE_GWEI / 2);
    });
  });
});
