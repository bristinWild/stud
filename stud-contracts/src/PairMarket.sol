// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {PairToken} from "./PairToken.sol";

interface IPairRegistryMarket {
    struct Pair {
        uint256 id;
        address memberA;
        address memberB;
        uint256 reputation;
        uint64 createdAt;
        bool active;
    }

    function getPair(uint256 pairId) external view returns (Pair memory);
}

contract PairMarket is ReentrancyGuard {
    using SafeERC20 for IERC20;

    error InvalidPairRegistry();
    error InvalidQuoteToken();
    error InvalidPairId();
    error PairNotFound();
    error PairNotActive();
    error InvalidTokenAmount();
    error InvalidQuoteDecimals();
    error MarketCapacityExceeded();
    error InsufficientSupply();
    error InsufficientReserve();

    error BuySlippageExceeded();
    error SellSlippageExceeded();

    uint256 public constant TOKEN_UNIT = 1 ether;

    /*
     * Reputation required before a Pair
     * can become graduation eligible.
     */
    uint256 public constant GRADUATION_REPUTATION = 70;

    IPairRegistryMarket public immutable pairRegistry;

    IERC20 public immutable quoteToken;

    PairToken public immutable pairToken;

    uint256 public immutable pairId;

    /*
     * One full unit of the quote asset.
     *
     * USDC:
     * quoteUnit = 1_000_000
     */
    uint256 public immutable quoteUnit;

    /*
     * Starting token price:
     *
     * $0.10 when using USDC.
     */
    uint256 public immutable basePrice;

    /*
     * Every additional whole Pair Token
     * increases the next token price
     * by $0.01.
     */
    uint256 public immutable slope;

    /*
     * Amount of quote asset currently
     * backing the market.
     */
    uint256 public reserve;

    event TokensBought(address indexed buyer, uint256 indexed pairId, uint256 tokenAmount, uint256 quoteAmount);

    event TokensSold(address indexed seller, uint256 indexed pairId, uint256 tokenAmount, uint256 quoteAmount);

    constructor(
        address pairRegistry_,
        address quoteToken_,
        uint256 pairId_,
        string memory tokenName_,
        string memory tokenSymbol_
    ) {
        if (pairRegistry_ == address(0)) {
            revert InvalidPairRegistry();
        }

        if (quoteToken_ == address(0)) {
            revert InvalidQuoteToken();
        }

        if (pairId_ == 0) {
            revert InvalidPairId();
        }

        pairRegistry = IPairRegistryMarket(pairRegistry_);

        IPairRegistryMarket.Pair memory pair = pairRegistry.getPair(pairId_);

        if (pair.id == 0) {
            revert PairNotFound();
        }

        if (!pair.active) {
            revert PairNotActive();
        }

        uint8 decimals = IERC20Metadata(quoteToken_).decimals();

        /*
         * We need at least two decimals
         * because our slope is 0.01.
         */
        if (decimals < 2 || decimals > 18) {
            revert InvalidQuoteDecimals();
        }

        pairId = pairId_;

        quoteToken = IERC20(quoteToken_);

        quoteUnit = 10 ** uint256(decimals);

        basePrice = quoteUnit / 10;

        slope = quoteUnit / 100;

        /*
         * PairMarket itself owns the token.
         *
         * Therefore only this market can
         * mint or burn Pair Tokens.
         */
        pairToken = new PairToken(tokenName_, tokenSymbol_, pairId_, address(this));
    }

    function buy(uint256 tokenAmount, uint256 maxQuoteAmount) external nonReentrant {
        _validateWholeTokenAmount(tokenAmount);

        IPairRegistryMarket.Pair memory pair = pairRegistry.getPair(pairId);

        if (!pair.active) {
            revert PairNotActive();
        }

        uint256 cost = quoteBuy(tokenAmount);

        if (cost > maxQuoteAmount) {
            revert BuySlippageExceeded();
        }

        uint256 newReserve = reserve + cost;

        if (newReserve > marketCapacity()) {
            revert MarketCapacityExceeded();
        }

        quoteToken.safeTransferFrom(msg.sender, address(this), cost);

        reserve = newReserve;

        pairToken.mint(msg.sender, tokenAmount);

        emit TokensBought(msg.sender, pairId, tokenAmount, cost);
    }

    function sell(uint256 tokenAmount, uint256 minQuoteAmount) external nonReentrant {
        _validateWholeTokenAmount(tokenAmount);

        uint256 refund = quoteSell(tokenAmount);

        if (refund < minQuoteAmount) {
            revert SellSlippageExceeded();
        }

        if (refund > reserve) {
            revert InsufficientReserve();
        }

        IERC20(address(pairToken)).safeTransferFrom(msg.sender, address(this), tokenAmount);

        pairToken.burn(tokenAmount);

        reserve -= refund;

        quoteToken.safeTransfer(msg.sender, refund);

        emit TokensSold(msg.sender, pairId, tokenAmount, refund);
    }

    function quoteBuy(uint256 tokenAmount) public view returns (uint256) {
        _validateWholeTokenAmount(tokenAmount);

        uint256 currentSupply = pairToken.totalSupply() / TOKEN_UNIT;

        uint256 amount = tokenAmount / TOKEN_UNIT;

        /*
         * Discrete linear bonding curve.
         *
         * Price:
         *
         * P(n) = basePrice + slope * n
         *
         * Buying k tokens from supply s:
         *
         * basePrice * k
         * +
         * slope *
         * (
         *   s*k +
         *   k*(k-1)/2
         * )
         */
        return (basePrice * amount) + (slope * (currentSupply * amount + (amount * (amount - 1)) / 2));
    }

    function quoteSell(uint256 tokenAmount) public view returns (uint256) {
        _validateWholeTokenAmount(tokenAmount);

        uint256 currentSupply = pairToken.totalSupply() / TOKEN_UNIT;

        uint256 amount = tokenAmount / TOKEN_UNIT;

        if (amount > currentSupply) {
            revert InsufficientSupply();
        }

        uint256 supplyAfterSale = currentSupply - amount;

        /*
         * Selling walks backwards down
         * exactly the same curve.
         *
         * Therefore, ignoring future fees,
         * buying and immediately selling
         * returns the same quote amount.
         */
        return (basePrice * amount) + (slope * (supplyAfterSale * amount + (amount * (amount - 1)) / 2));
    }

    function marketCapacity() public view returns (uint256) {
        IPairRegistryMarket.Pair memory pair = pairRegistry.getPair(pairId);

        uint256 reputation = pair.reputation;

        /*
         * New
         * Reputation 0 - 19
         */
        if (reputation < 20) {
            return 500 * quoteUnit;
        }

        /*
         * Growing
         * Reputation 20 - 49
         */
        if (reputation < 50) {
            return 2_000 * quoteUnit;
        }

        /*
         * Established
         * Reputation 50 - 69
         */
        if (reputation < 70) {
            return 10_000 * quoteUnit;
        }

        /*
         * Graduation stage
         *
         * Once reputation reaches 70,
         * allow enough room for reserve
         * to cross the $10,000 graduation
         * threshold.
         */
        return 20_000 * quoteUnit;
    }

    function isGraduationEligible() external view returns (bool) {
        IPairRegistryMarket.Pair memory pair = pairRegistry.getPair(pairId);

        return pair.reputation >= GRADUATION_REPUTATION && reserve >= 10_000 * quoteUnit;
    }

    function currentPrice() external view returns (uint256) {
        uint256 currentSupply = pairToken.totalSupply() / TOKEN_UNIT;

        return basePrice + (slope * currentSupply);
    }

    function totalSupply() external view returns (uint256) {
        return pairToken.totalSupply();
    }

    function _validateWholeTokenAmount(uint256 tokenAmount) internal pure {
        if (tokenAmount == 0 || tokenAmount % TOKEN_UNIT != 0) {
            revert InvalidTokenAmount();
        }
    }
}
