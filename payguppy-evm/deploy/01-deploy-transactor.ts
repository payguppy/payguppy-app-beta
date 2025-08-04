import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

import verify from './utils/verify'
// import { networkConfig, developmentChains } from '../helpers/hardhat-config'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre
  const { deploy, log } = deployments

  const { deployer } = await getNamedAccounts()

  const contract = await deploy('PayGuppyTransactor', {
    from: deployer,
    log: true,
    // wait on live network to verify properly
    // waitConfirmations:5,
  })
  log(`PayGuppyTransactor: ${contract.address}`)

  // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
  //   await verify(contract.address, [])
  // }
}
export default func
func.tags = ['transactor', 'test']
