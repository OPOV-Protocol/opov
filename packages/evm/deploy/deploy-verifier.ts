import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {ethers} = hre;
    const worldIDAddress = await fetch('https://developer.worldcoin.org/api/v1/contracts')
        .then(res => res.json() as Promise<{ key: string; value: string }[]>)
        .then(res =>
            res.find(({key}) => key === 'op-goerli.id.worldcoin.eth')?.value);

    if (!worldIDAddress) {
        throw new Error('WorldID address not found');
    }

    const ContractFactory = await ethers.getContractFactory('OPOVPoPVerifier');

    const deployTx = await ContractFactory.getDeployTransaction(
        worldIDAddress,
        'app_staging_465fadc3db6afe30e7b43ea029771dcd',
        'pop-verification',
        '0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1',
        10160,
    );

    const deployGas = await ethers.provider.estimateGas(deployTx);

    const verifier = await ContractFactory.deploy(
        worldIDAddress,
        'app_staging_465fadc3db6afe30e7b43ea029771dcd',
        'pop-verification',
        '0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1',
        10160,
        {
            gasPrice: ethers.parseUnits('30', 'gwei'),
            gasLimit: deployGas
        }
    );

    await verifier.waitForDeployment();

    console.log('Verifier deployed to', verifier.target);
}

export default deploy;

deploy.tags = ['verifier'];