async function main() {
  const Faucet = await ethers.getContractFactory("LoveFaucet");
  const faucet = await Faucet.deploy();

  await faucet.deployed();

  console.log(`LoveToken deployed to ${faucet.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
