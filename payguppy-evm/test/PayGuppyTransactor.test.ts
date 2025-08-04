import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseGwei } from "viem";

function getRandom0xBytesHex(length = 20) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

describe("PayGuppyTransactor", () => {
  const orgId = getRandom0xBytesHex(32) as `0x${string}`

  async function fixture() {
    const [owner, buyer, merchant, treasury, wallet1] = await hre.viem.getWalletClients();

    const cMockUSDC = await hre.viem.deployContract("MockToken");
    const cPayGuppyToken = await hre.viem.deployContract("MockToken");
    const cTransactor = await hre.viem.deployContract("PayGuppyTransactor")

    await cMockUSDC.write.transfer([buyer.account.address, 1000000000000000000000n], { account: owner.account })
    await cPayGuppyToken.write.transfer([treasury.account.address, 1000000000000000000000n]), { account: owner.account };

    return {
      owner,
      buyer,
      merchant,
      treasury,
      wallet1,
      cTransactor,
      cPayGuppyToken,
      cMockUSDC,
    }
  }

  describe("Deployment", async () => {
    it('should be deployed', async () => {
      const { cTransactor } = await loadFixture(fixture)

      expect(cTransactor).to.be.not.null
    });
  });
  describe("Functions", () => {
    it('should set org rewards', async () => {
      const { cTransactor, cMockUSDC, cPayGuppyToken, treasury } = await loadFixture(fixture)
      const rewardMultiplier = 500000000000000000n;
      await cTransactor.write.setOrganizationRewards([
        orgId,
        cMockUSDC.address,
        rewardMultiplier,
        cPayGuppyToken.address,
        treasury.account.address
      ]);
    });

    it('should be able to pay', async () => {
      const { cTransactor, cMockUSDC, cPayGuppyToken, buyer, merchant, treasury } = await loadFixture(fixture)
      const rewardMultiplier = 10000000000000000n;

      console.log('orgId', orgId)
      // treasury allows Transactor
      cPayGuppyToken.write.approve([
        cTransactor.address,
        1000000000000000000000n
      ], { account: treasury.account });

      await cTransactor.write.setOrganizationRewards([
        orgId,
        cMockUSDC.address,
        rewardMultiplier,
        cPayGuppyToken.address,
        treasury.account.address
      ]);

      const paymentAmount = 100000000000000000000n

      await cMockUSDC.write.approve([
        cTransactor.address,
        paymentAmount
      ], {
        account: buyer.account
      })

      await cTransactor.write.sendPayment([
        buyer.account.address,
        merchant.account.address,
        paymentAmount,
        cMockUSDC.address,
        orgId
      ], {
        account: buyer.account
      })

      const rewardsBalance = await cPayGuppyToken.read.balanceOf([
        buyer.account.address
      ])

      console.log(rewardsBalance)

      // balance of treasury
      const treasuryBalance = await cPayGuppyToken.read.balanceOf([treasury.account.address])
      console.log({treasuryBalance})

    })
  });
});
