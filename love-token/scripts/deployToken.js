async function main() {
  const LoveToken = await ethers.getContractFactory("LoveToken");
  const loveToken = await LoveToken.deploy();

  await loveToken.deployed();

  console.log(`LoveToken deployed to ${lock.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
