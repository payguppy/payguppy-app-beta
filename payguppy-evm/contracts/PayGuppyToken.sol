// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {Organization} from "./PayGuppyTransactor.sol";

interface IPayGuppyRewardsToken {
    function sendRewards(address, uint256) external;
}

contract PayGuppyToken is IPayGuppyRewardsToken, ERC20 {
    constructor() ERC20("PayGuppy", "GUP") {}

    function sendRewards(address receiver, uint256 amount) public {
        _mint(receiver, amount);
    }
}
