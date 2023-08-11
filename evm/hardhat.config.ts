import * as dotenv from "dotenv";
dotenv.config();

import {HardhatUserConfig, task} from 'hardhat/config';
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {HardhatEthersSigner} from '@nomicfoundation/hardhat-ethers/signers';
import { Contract } from "ethers";

task("setAttester", "Set attester address")
    .addParam('verifier', 'Verifier address')
    .addParam('attester', 'Attester address')
    .setAction(async (args: {verifier: string, attester: string}, hre: HardhatRuntimeEnvironment) => {
      const {ethers} = hre;

      const signer: HardhatEthersSigner = (await ethers.getSigners())[0];

      const Verifier = await ethers.getContractFactory('OPOVPoPVerifier');
      const verifierInstance = Verifier.attach(args.verifier).connect(signer) as Contract;

      await verifierInstance.setAttester(args.attester);
    });

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    optimismGoerli: {
      url: `https://optimism-goerli.infura.io/v3/6ee90d72c4aa4cfd978f2592c98f8313`,
      accounts: [process.env.WALLET_KEY as string],
    },
    'base-mainnet': {
      url: 'https://mainnet.base.org',
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    },
    'base-goerli': {
      url: 'https://goerli.base.org',
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    },
    'base-local': {
      url: 'http://localhost:8545',
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    },
  },
};

export default config;
