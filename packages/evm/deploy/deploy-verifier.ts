import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {ethers} = hre;

    const ContractFactory = await ethers.getContractFactory('OPOVPoPVerifier');

    const deployTx = await ContractFactory.getDeployTransaction(
        '0x78eC127A3716D447F4575E9c834d452E397EE9E1',
        'app_staging_465fadc3db6afe30e7b43ea029771dcd',
        'pop-verification',
        '0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1',
        10160,
    );

    const deployGas = await ethers.provider.estimateGas(deployTx);

    const verifier = await ContractFactory.deploy(
        '0x515f06B36E6D3b707eAecBdeD18d8B384944c87f',
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