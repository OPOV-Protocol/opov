import * as dotenv from 'dotenv'
dotenv.config()

import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {ethers} = hre

  const ContractFactory = await ethers.getContractFactory('OPOVPoPVerifier')

  const deployTx = await ContractFactory.getDeployTransaction(
    process.env.NEXT_PUBLIC_WORLD_ID_ADDRESS!,
    process.env.NEXT_PUBLIC_WORLD_ID_APP_ID!,
    process.env.NEXT_PUBLIC_EAS_ACTION!
  )

  const deployGas = await ethers.provider.estimateGas(deployTx)

  const verifier = await ContractFactory.deploy(
    process.env.NEXT_PUBLIC_WORLD_ID_ADDRESS!,
    process.env.NEXT_PUBLIC_WORLD_ID_APP_ID!,
    process.env.NEXT_PUBLIC_EAS_ACTION!,
    {
      gasPrice: ethers.parseUnits('30', 'gwei'),
      gasLimit: deployGas
    }
  )

  await verifier.waitForDeployment()

  console.log('Verifier deployed to', verifier.target)
}

export default deploy

deploy.tags = ['verifier']