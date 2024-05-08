import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai";
import hre from "hardhat";

import { ERC20_ABI } from "./ERC20_ABI";

describe("Lock", function () {
  const ONE_GWEI = 1_000_000_000;

  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, ownerA] = await hre.ethers.getSigners();

    const addressProvider = "0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b";
    const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

    const AaveStokvel = await hre.ethers.getContractFactory("AaveStokvel");
    const contract = await AaveStokvel.deploy(addressProvider, usdcAddress);

    const USDC = new hre.ethers.Contract(
      usdcAddress,
      ERC20_ABI,
      hre.ethers.provider
    );

    const usdcWhale = await hre.ethers.getImpersonatedSigner(
      "0x266798c8b402691bde96545bc54e48300e812399"
    );

    return { contract, owner, ownerA, USDC, usdcWhale };
  }

  describe("Deployment", function () {
    it("Should deposit and withdraw successfully", async function () {
      const { contract, ownerA, USDC, usdcWhale } = await loadFixture(
        deployOneYearLockFixture
      );

      // 11 USD
      // let bal = await USDC.balanceOf(usdcWhale);

      await USDC.connect(usdcWhale).transfer(ownerA, 5 * Math.pow(10, 6));

      expect(await USDC.balanceOf(ownerA)).to.equal(5 * Math.pow(10, 6));

      let depositAmt = 1 * Math.pow(10, 6);

      const tx = await USDC.connect(ownerA).approve(
        contract.getAddress(),
        depositAmt
      );

      await tx.wait();

      await contract.connect(ownerA).depositUSDC(depositAmt);

      expect(await USDC.balanceOf(ownerA)).to.equal(4 * Math.pow(10, 6));

      expect(await contract.getUserUSDCBalance(ownerA)).to.equal(depositAmt);
    });
  });
});
