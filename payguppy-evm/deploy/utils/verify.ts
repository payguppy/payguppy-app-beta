import { run } from 'hardhat'

const verify = async (contractAddress: string, args: any[], options: object = {}) => {
  console.log('Verifying contract...')
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args,
      ...options,
    })
    //@ts-ignore
  } catch (e: any) {
    if (e.message.toLowerCase().includes('already verified')) {
      console.log('Already verified!')
    } else {
      console.log(e)
    }
  }
}

export default verify
