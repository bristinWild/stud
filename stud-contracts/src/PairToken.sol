// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PairToken is ERC20, Ownable {
    error InvalidPairId();

    uint256 public immutable pairId;

    constructor(string memory name_, string memory symbol_, uint256 pairId_, address initialController)
        ERC20(name_, symbol_)
        Ownable(initialController)
    {
        if (pairId_ == 0) {
            revert InvalidPairId();
        }

        pairId = pairId_;
    }

    /**
     * @notice Mint Pair Tokens after a successful market purchase.
     *
     * Eventually the PairMarket contract will own this token,
     * so only the market can increase supply.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens held by the controller.
     *
     * During a sell:
     *
     * user
     *   ↓ transferFrom()
     * PairMarket
     *   ↓ burn()
     * PairToken
     *
     * This guarantees supply decreases when tokens are sold
     * back into the bonding curve.
     */
    function burn(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
    }
}
