import { createPublicClient, createWalletClient, http, getContract } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import TransactorArtifacts from '../artifacts/contracts/PayGuppyTransactor.sol/PayGuppyTransactor.json'

const rpcUrl = 'https://rpc.sepolia-api.lisk.com';
const publicClient = createPublicClient({
  transport: http(rpcUrl),
});

const account = privateKeyToAccount('')

const walletClient = createWalletClient({
  transport: http(rpcUrl),
  account,
});

async function main() {

  const contract = getContract({
    abi: TransactorArtifacts.abi,
    address: '0x01deaCA250E98F6c9A567aA95E69Ef5670613707',
    client: walletClient,
  })

  const args = [
    '0xb820f9c0a40cc825772fe5e43dc0462a9d5ec877490008f2d471fe062ed7ff61',
    '0x83FE64Bc14b124f65Eb5249b9BA45b66e3eFFe4C',
    10000000000000000n,
    '0x83FE64Bc14b124f65Eb5249b9BA45b66e3eFFe4C',
    '0x83FE64Bc14b124f65Eb5249b9BA45b66e3eFFe4C'
  ]

  // await contract.write.setOrganizationRewards(, { });

  console.time('simulate')
  const { result, request } = await publicClient.simulateContract({
    address: '0x01deaCA250E98F6c9A567aA95E69Ef5670613707',
    abi: TransactorArtifacts.abi,
    functionName: 'setOrganizationRewards',
    args,
    account,
  });
  console.timeEnd('simulate')
  console.log({ result })
  console.time('write')
  // console.log(request)
  const hash = await walletClient.writeContract(request);
  
  console.timeEnd('write')
  console.log({ hash })

  console.time('receipt')
  await publicClient.waitForTransactionReceipt({ hash });
  console.timeEnd('receipt')
  console.log('Done!')
}

main()
