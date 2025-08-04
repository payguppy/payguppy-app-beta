// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPayGuppyRewardsToken} from "./PayGuppyToken.sol";

import "hardhat/console.sol";

struct Organization {
    bytes32 id;
    mapping(address => uint256) rewardMultiplier;
    address rewardsToken;
    address treasuryAddress;
}

contract PayGuppyTransactor {
    mapping(bytes32 => Organization) orgRewards;

    function setOrganizationRewards(
        bytes32 organizationId,
        address paymentToken,
        uint256 rewardsMultiplier,
        address rewardsToken,
        address treasuryAddress
    ) public {
        Organization storage org = orgRewards[organizationId];

        org.id = organizationId;
        org.rewardMultiplier[paymentToken] = rewardsMultiplier;
        org.rewardsToken = rewardsToken;
        org.treasuryAddress = treasuryAddress;
    }

    function sendPayment(
        address from,
        address to,
        uint256 amount,
        address token,
        bytes32 organizationId
    ) public payable {
        // if token is 0x0 == native currency

        // if token is not 0x0 , send as ERC20
        IERC20(token).transferFrom(from, to, amount);

        // calc Rewards
        Organization storage org = orgRewards[organizationId];
        console.log(org.rewardMultiplier[token]);
        console.log(10**18);

        uint256 rewards = amount * org.rewardMultiplier[token] / 10**18;

        // send rewards
        IERC20(org.rewardsToken).transferFrom(org.treasuryAddress, from, rewards);

        // emit event
    }
}
