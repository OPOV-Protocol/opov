import { ethers } from "hardhat";

async function main() {
  const worldIDAddress = await fetch('https://developer.worldcoin.org/api/v1/contracts')
      .then(res => res.json() as Promise<{ key: string; value: string }[]>)
      .then(res =>
          res.find(({ key }) => key === 'op-goerli.id.worldcoin.eth')?.value)

      const ContractFactory = await ethers.getContractFactory('OPOVPoPVerifier');
      const verifier = await ContractFactory.deploy(
          worldIDAddress,
          "app_staging_465fadc3db6afe30e7b43ea029771dcd",
          "pop-verification",
          "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
          10160
      );

      await verifier.waitForDeployment();

      console.log('Verifier deployed to', verifier.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
