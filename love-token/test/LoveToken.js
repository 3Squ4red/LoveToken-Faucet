const { expect } = require("chai");
const hre = require("hardhat");

describe("loveToken contract", function () {
  // global vars
  let Token;
  let loveToken;
  let creator;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("LoveToken");
    [creator, addr1, addr2] = await hre.ethers.getSigners();

    loveToken = await Token.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right creator", async function () {
      expect(await loveToken.creator()).to.equal(creator.address);
    });

    it("Should assign the total supply of tokens to the creator", async function () {
      const creatorBalance = await loveToken.balanceOf(creator.address);
      expect(await loveToken.totalSupply()).to.equal(creatorBalance);
    });

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await loveToken.cap();
      expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(100000000);
    });

    it("Should set the blockReward 50", async function () {
      const blockReward = await loveToken.blockReward();
      expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(50);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from creator to addr1
      await loveToken.transfer(addr1.address, 50);
      const addr1Balance = await loveToken.balanceOf(addr1.address);
      expect(Math.trunc(hre.ethers.utils.formatEther(addr1Balance))).to.equal(
        50.0
      );

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await loveToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await loveToken.balanceOf(addr2.address);
      expect(Math.trunc(hre.ethers.utils.formatEther(addr2Balance))).to.equal(
        50
      );
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialcreatorBalance = await loveToken.balanceOf(creator.address);
      // Try to send 1 token from addr1 (0 tokens) to creator (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        loveToken.connect(addr1).transfer(creator.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // creator balance shouldn't have changed.
      expect(await loveToken.balanceOf(creator.address)).to.equal(
        initialcreatorBalance
      );
    });

    it("Should update balances after transfers", async function () {
      let initialcreatorBalance = await loveToken.balanceOf(creator.address);
      initialcreatorBalance = hre.ethers.utils.formatEther(
        initialcreatorBalance
      );

      // Transfer 100 tokens from creator to addr1.
      await loveToken.transfer(addr1.address, 100);

      // Transfer another 50 tokens from creator to addr2.
      await loveToken.transfer(addr2.address, 50);

      // Check balances.
      let finalcreatorBalance = await loveToken.balanceOf(creator.address);
      finalcreatorBalance = hre.ethers.utils.formatEther(finalcreatorBalance);
      expect(initialcreatorBalance - finalcreatorBalance).to.equal(150);

      const addr1Balance = await loveToken.balanceOf(addr1.address);
      expect(Math.trunc(hre.ethers.utils.formatEther(addr1Balance))).to.equal(
        100
      );

      const addr2Balance = await loveToken.balanceOf(addr2.address);
      expect(Math.trunc(hre.ethers.utils.formatEther(addr2Balance))).to.equal(
        50
      );
    });
  });
});
