import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {OPOVGovernanceToken, TimelockController} from '../typechain-types';

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (
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
    console.log('OPOVGovernanceToken deployed to:', governanceToken.address);

    // Deploy timelock
    const minDelay = 60 * 60 * 24; // 1 day
    const timelock = await deploy('TimelockController', {
        from: address,
        args: [minDelay, [address], [address], address],
        log: true,
        autoMine: true,
    });
    console.log('TimelockController deployed to:', timelock.address);

    // Deploy governor
    const governor = await deploy('OPOVGovernor', {
        from: address,
        args: [governanceToken.address, timelock.address],
        log: true,
        autoMine: true,
    });
    console.log('OPOVGovernor deployed to:', governor.address);

    // Update TimelockController to set OPOVGovernor as proposer and executor and revoke deployer's roles
    const TimelockContract: TimelockController = await ethers.getContract('TimelockController', address);
    await TimelockContract.grantRole(ethers.id('PROPOSER_ROLE'), governor.address);
    await TimelockContract.grantRole(ethers.id('EXECUTOR_ROLE'), governor.address);
    await TimelockContract.revokeRole(ethers.id('PROPOSER_ROLE'), address);
    await TimelockContract.revokeRole(ethers.id('EXECUTOR_ROLE'), address);

    console.log('DAO deployment completed!');
};

export default deployYourContract;

deployYourContract.tags = ['dao'];
