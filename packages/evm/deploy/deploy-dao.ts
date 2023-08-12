import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {Contract} from 'ethers';

const deploy: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const {ethers} = hre;
    const signer = (await ethers.getSigners())[0];
    const address = await signer.getAddress();
    console.log('Deploying contracts from the account:', address);
    const {deploy} = hre.deployments;

    // Deploy governance token
    const governanceToken = await deploy('OPOVGovernanceToken', {
        from: address,
        log: true,
        autoMine: true,
    });

    // Deploy timelock
    const minDelay = 60 * 60 * 24; // 1 day
    const timelock = await deploy('OPOVTimelockController', {
        from: address,
        log: true,
        autoMine: true,
    });

    const timelockContract = await ethers.getContract('OPOVTimelockController', address) as Contract;
    await timelockContract.initialize(minDelay, [address], [address], address);

    // Deploy governor
    const governor = await deploy('OPOVGovernor', {
        from: address,
        log: true,
        autoMine: true,
    });

    const governorContract = await ethers.getContract('OPOVGovernor', address) as Contract;
    await governorContract.initialize(governanceToken.address, timelock.address);

    // Update TimelockController to set OPOVGovernor as proposer and executor and revoke deployer's roles
    await timelockContract.grantRole(ethers.id('PROPOSER_ROLE'), governor.address);
    await timelockContract.grantRole(ethers.id('EXECUTOR_ROLE'), governor.address);
    await timelockContract.revokeRole(ethers.id('PROPOSER_ROLE'), address);
    await timelockContract.revokeRole(ethers.id('EXECUTOR_ROLE'), address);

    await deploy('OPOVFactory', {
        from: address,
        log: true,
        autoMine: true,
    });

    const factoryContract = await ethers.getContract('OPOVFactory', address) as Contract;
    await factoryContract.initialize(governor.address);

    console.log('DAO deployment completed!');
};

export default deploy;

deploy.tags = ['dao'];