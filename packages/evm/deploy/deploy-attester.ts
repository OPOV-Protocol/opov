import {EAS} from '@ethereum-attestation-service/eas-sdk';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {ethers} = hre;
    let easAddress = '0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A';
    const eas = new EAS(easAddress);
    const signer = (await ethers.getSigners())[0];
    eas.connect(signer);

    const ContractFactory = await ethers.getContractFactory('OPOVAttester');

    const deployTx = await ContractFactory.getDeployTransaction(
        easAddress,
        '0x01c77dd30a5366733c3ce5d253625a7b0dbbfdadcbc61fe0a65bcbbcc741ceed',
        '0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1',
        10132,
    );

    const deployGas = await ethers.provider.estimateGas(deployTx);

    const attester = await ContractFactory.deploy(
        easAddress,
        '0x01c77dd30a5366733c3ce5d253625a7b0dbbfdadcbc61fe0a65bcbbcc741ceed',
        '0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1',
        10132,
        {
            gasPrice: ethers.parseUnits('20', 'gwei'),
            gasLimit: deployGas
        }
    );

    await attester.waitForDeployment();

    console.log('Attester deployed to', attester.target);
};

export default deploy;

deploy.tags = ['attester'];