import * as dotenv from 'dotenv';

dotenv.config();

import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import '@typechain/hardhat'
import '@nomicfoundation/hardhat-ethers'
// import '@nomicfoundation/hardhat-chai-matchers'
import "@nomicfoundation/hardhat-verify";

import {HardhatUserConfig, task} from 'hardhat/config';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {Contract, Signer} from 'ethers';

task('setAttester', 'Set attester address on verifier')
    .addParam('verifier', 'Verifier address')
    .addParam('attester', 'Attester address')
    .setAction(async (args: { verifier: string, attester: string }, hre: HardhatRuntimeEnvironment) => {
        const {ethers} = hre;

        const signer: Signer = (await ethers.getSigners())[0];
        const signerAddress = await signer.getAddress()

        const Verifier = await ethers.getContractFactory('OPOVPoPVerifier');
        const verifierInstance = Verifier.attach(args.verifier).connect(signer) as Contract;
        const target = await verifierInstance.getAddress();

        const estimateTx = {
            to: target,
            data: verifierInstance.interface.encodeFunctionData("setAttester", [args.attester])
        }
        const gasPrice = await ethers.provider.estimateGas(estimateTx)

        await verifierInstance.setAttester(args.attester, {gasPrice});
    });

task('setVerifier', 'Set attester address on verifier')
    .addParam('verifier', 'Verifier address')
    .addParam('attester', 'Attester address')
    .setAction(async (args: { verifier: string, attester: string }, hre: HardhatRuntimeEnvironment) => {
        const {ethers} = hre;

        const signer: Signer = (await ethers.getSigners())[0];

        const Attester = await ethers.getContractFactory('OPOVAttester');
        const attesterInstance = Attester.attach(args.attester).connect(signer) as Contract;

        await attesterInstance.setVerifier(args.verifier);
    });

task('testMint', 'Test minting')
    .addOptionalParam('address', 'Address')
    .addParam('amount', 'Amount')
    .setAction(async (args: { address: string, amount: string }, hre: HardhatRuntimeEnvironment) => {
        const {ethers} = hre;

        const signer: Signer = (await ethers.getSigners())[0];
        const OPOVGovernanceToken = await ethers.getContractFactory('OPOVGovernanceToken');
        const contract = OPOVGovernanceToken.attach(args.address).connect(signer) as Contract;
        const address = await signer.getAddress();

        await contract.mint(address, args.amount);
        console.log(`Minted ${args.amount} to ${args.address}`);
    });

task('balance', 'Get balance')
    .addOptionalParam('address', 'Address')
    .setAction(async (args: { address: string }, hre: HardhatRuntimeEnvironment) => {
        const {ethers, getUnnamedAccounts} = hre;
        const accounts = await getUnnamedAccounts();
        const balance = await ethers.provider.getBalance(args.address ?? accounts[0]);
        console.log(balance.toString());
    });

task('listAccounts', 'List accounts')
    .setAction(async (args: { address: string }, hre: HardhatRuntimeEnvironment) => {
        const {getUnnamedAccounts} = hre;
        const accounts = await getUnnamedAccounts();
        console.log(accounts);
    });

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.17',
        settings: {
            optimizer: {
                enabled: true,
                // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
                runs: 200,
            },
        },
    },
    defaultNetwork: 'base-goerli',
    networks: {
        'optimism-mainnet': {
            url: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
            accounts: [process.env.WALLET_KEY as string],
        },
        'optimism-goerli': {
            url: `https://optimism-goerli.infura.io/v3/${process.env.INFURA_KEY}`,
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
    etherscan: {
        apiKey: `${process.env.ETHERSCAN_KEY}`,
    },
};

export default config;
