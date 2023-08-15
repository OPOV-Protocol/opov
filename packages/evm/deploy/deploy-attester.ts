import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {ethers} = hre
  let easAddress = '0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A'
  let schema = '0x01c77dd30a5366733c3ce5d253625a7b0dbbfdadcbc61fe0a65bcbbcc741ceed'

  const ContractFactory = await ethers.getContractFactory('OPOVAttester')
  const deployTx = await ContractFactory.getDeployTransaction(easAddress, schema)
  const deployGas = await ethers.provider.estimateGas(deployTx)

  const attester = await ContractFactory.deploy(easAddress, schema, {
    gasPrice: ethers.parseUnits('20', 'gwei'),
    gasLimit: deployGas
  })

  await attester.waitForDeployment()

  console.log('Attester deployed to', attester.target)
}

export default deploy

deploy.tags = ['attester']