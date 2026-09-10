// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {PairMarket, IPairRegistryMarket} from "../src/PairMarket.sol";

import {PairToken} from "../src/PairToken.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract MockPairRegistryForMarket is IPairRegistryMarket {
    IPairRegistryMarket.Pair private pair;

    constructor() {
        pair = IPairRegistryMarket.Pair({
            id: 1,
            memberA: address(0xA11CE),
            memberB: address(0xB0B),
            reputation: 0,
            createdAt: uint64(block.timestamp),
            active: true
        });
    }

    function getPair(uint256 pairId_) external view override returns (IPairRegistryMarket.Pair memory) {
        if (pairId_ != pair.id) {
            return IPairRegistryMarket.Pair({
                id: 0, memberA: address(0), memberB: address(0), reputation: 0, createdAt: 0, active: false
            });
        }

        return pair;
    }

    function setReputation(uint256 reputation_) external {
        pair.reputation = reputation_;
    }

    function setActive(bool active_) external {
        pair.active = active_;
    }
}

contract PairMarketTest is Test {
    uint256 internal constant PAIR_ID = 1;

    uint256 internal constant USDC = 1e6;

    MockPairRegistryForMarket internal pairRegistry;

    MockUSDC internal usdc;

    PairMarket internal market;

    PairToken internal pairToken;

    address internal investor = address(0xBEEF);

    function setUp() public {
        pairRegistry = new MockPairRegistryForMarket();

        usdc = new MockUSDC();

        market = new PairMarket(address(pairRegistry), address(usdc), PAIR_ID, "Alice Leo", "ALICELEO");

        pairToken = market.pairToken();

        /*
         * Give investor enough mock USDC
         * for all tests.
         */
        usdc.mint(investor, 50_000 * USDC);

        vm.prank(investor);

        usdc.approve(address(market), type(uint256).max);
    }

    function test_MarketStoresPairId() public view {
        assertEq(market.pairId(), PAIR_ID);
    }

    function test_MarketCreatedCorrectPairToken() public view {
        assertEq(pairToken.pairId(), PAIR_ID);

        assertEq(pairToken.name(), "Alice Leo");

        assertEq(pairToken.symbol(), "ALICELEO");
    }

    function test_MarketOwnsPairToken() public view {
        assertEq(pairToken.owner(), address(market));
    }

    function test_USDCParametersAreCorrect() public view {
        /*
         * USDC = 6 decimals.
         */
        assertEq(market.quoteUnit(), 1_000_000);

        /*
         * $0.10
         */
        assertEq(market.basePrice(), 100_000);

        /*
         * $0.01
         */
        assertEq(market.slope(), 10_000);
    }

    function test_MarketStartsEmpty() public view {
        assertEq(market.reserve(), 0);

        assertEq(pairToken.totalSupply(), 0);

        assertEq(market.currentPrice(), 100_000);
    }

    function test_FirstTokenCostsTenCents() public view {
        assertEq(market.quoteBuy(1 ether), 100_000);
    }

    function test_ThreeTokensCostThirtyThreeCents() public view {
        /*
         * Token #1 = $0.10
         * Token #2 = $0.11
         * Token #3 = $0.12
         *
         * Total = $0.33
         */
        assertEq(market.quoteBuy(3 ether), 330_000);
    }

    function test_BuyUpdatesSupplyReserveAndPrice() public {
        uint256 balanceBefore = usdc.balanceOf(investor);

        vm.prank(investor);

        market.buy(3 ether, type(uint256).max);

        assertEq(pairToken.balanceOf(investor), 3 ether);

        assertEq(pairToken.totalSupply(), 3 ether);

        assertEq(market.reserve(), 330_000);

        /*
         * Next token is now $0.13.
         */
        assertEq(market.currentPrice(), 130_000);

        assertEq(usdc.balanceOf(investor), balanceBefore - 330_000);
    }

    function test_SellQuoteWalksBackCurve() public {
        vm.prank(investor);

        market.buy(3 ether, type(uint256).max);

        /*
         * Supply:
         *
         * #1 = $0.10
         * #2 = $0.11
         * #3 = $0.12
         *
         * Selling one removes
         * token #3.
         */
        assertEq(market.quoteSell(1 ether), 120_000);
    }

    function test_SellUpdatesSupplyReserveAndPrice() public {
        vm.prank(investor);

        market.buy(3 ether, type(uint256).max);

        vm.prank(investor);

        pairToken.approve(address(market), type(uint256).max);

        vm.prank(investor);

        market.sell(1 ether, 0);

        assertEq(pairToken.balanceOf(investor), 2 ether);

        assertEq(pairToken.totalSupply(), 2 ether);

        /*
         * $0.33 reserve
         * - $0.12 refund
         * = $0.21
         */
        assertEq(market.reserve(), 210_000);

        /*
         * Supply = 2,
         * so next token costs $0.12.
         */
        assertEq(market.currentPrice(), 120_000);
    }

    function test_BuyThenSellAllReturnsToZero() public {
        uint256 balanceBefore = usdc.balanceOf(investor);

        vm.prank(investor);

        market.buy(3 ether, type(uint256).max);

        vm.prank(investor);

        pairToken.approve(address(market), 3 ether);

        vm.prank(investor);

        market.sell(3 ether, 0);

        assertEq(pairToken.totalSupply(), 0);

        assertEq(pairToken.balanceOf(investor), 0);

        assertEq(market.reserve(), 0);

        assertEq(usdc.balanceOf(investor), balanceBefore);

        assertEq(market.currentPrice(), 100_000);
    }

    function test_RejectsZeroTokenAmount() public {
        vm.expectRevert(PairMarket.InvalidTokenAmount.selector);

        market.quoteBuy(0);
    }

    function test_RejectsFractionalTokenAmount() public {
        vm.expectRevert(PairMarket.InvalidTokenAmount.selector);

        market.quoteBuy(0.5 ether);
    }

    function test_CannotSellMoreThanSupply() public {
        vm.expectRevert(PairMarket.InsufficientSupply.selector);

        market.quoteSell(1 ether);
    }

    function test_NewPairHasFiveHundredDollarCapacity() public view {
        assertEq(market.marketCapacity(), 500 * USDC);
    }

    function test_ReputationChangesCapacityNotPrice() public {
        /*
         * Initial state:
         *
         * rep = 0
         * capacity = $500
         * price = $0.10
         */
        assertEq(market.marketCapacity(), 500 * USDC);

        assertEq(market.currentPrice(), 100_000);

        pairRegistry.setReputation(20);

        /*
         * Reputation unlocks capacity.
         */
        assertEq(market.marketCapacity(), 2_000 * USDC);

        /*
         * But reputation does NOT
         * manipulate token price.
         */
        assertEq(market.currentPrice(), 100_000);

        pairRegistry.setReputation(50);

        assertEq(market.marketCapacity(), 10_000 * USDC);

        assertEq(market.currentPrice(), 100_000);

        pairRegistry.setReputation(70);

        assertEq(market.marketCapacity(), 20_000 * USDC);

        assertEq(market.currentPrice(), 100_000);
    }

    function test_CapacityBoundaries() public {
        pairRegistry.setReputation(19);

        assertEq(market.marketCapacity(), 500 * USDC);

        pairRegistry.setReputation(20);

        assertEq(market.marketCapacity(), 2_000 * USDC);

        pairRegistry.setReputation(49);

        assertEq(market.marketCapacity(), 2_000 * USDC);

        pairRegistry.setReputation(50);

        assertEq(market.marketCapacity(), 10_000 * USDC);

        pairRegistry.setReputation(69);

        assertEq(market.marketCapacity(), 10_000 * USDC);

        pairRegistry.setReputation(70);

        assertEq(market.marketCapacity(), 20_000 * USDC);
    }

    function test_CannotBuyBeyondInitialCapacity() public {
        /*
         * Cost of first 306 tokens:
         *
         * $497.25
         *
         * Still below $500.
         */
        assertEq(market.quoteBuy(306 ether), 497_250_000);

        vm.prank(investor);

        market.buy(306 ether, type(uint256).max);

        assertEq(market.reserve(), 497_250_000);

        /*
         * Token #307 costs $3.16.
         *
         * $497.25 + $3.16
         * = $500.41
         *
         * Therefore it exceeds
         * initial capacity.
         */
        vm.expectRevert(PairMarket.MarketCapacityExceeded.selector);

        vm.prank(investor);

        market.buy(1 ether, type(uint256).max);
    }

    function test_ReputationAloneDoesNotGraduate() public {
        pairRegistry.setReputation(70);

        assertEq(market.reserve(), 0);

        assertFalse(market.isGraduationEligible());
    }

    function test_GraduationRequiresReputationAndReserve() public {
        pairRegistry.setReputation(70);

        /*
         * Buying 1,405 tokens costs:
         *
         * $10,003.60
         *
         * This crosses the $10,000
         * reserve requirement.
         */
        assertEq(market.quoteBuy(1_405 ether), 10_003_600_000);

        vm.prank(investor);

        market.buy(1_405 ether, type(uint256).max);

        assertGe(market.reserve(), 10_000 * USDC);

        assertTrue(market.isGraduationEligible());
    }

    function test_InactivePairCannotReceiveNewBuys() public {
        pairRegistry.setActive(false);

        vm.expectRevert(PairMarket.PairNotActive.selector);

        vm.prank(investor);

        market.buy(1 ether, type(uint256).max);
    }

    function test_InvestorCanExitAfterPairBecomesInactive() public {
        vm.prank(investor);

        market.buy(3 ether, type(uint256).max);

        vm.prank(investor);

        pairToken.approve(address(market), type(uint256).max);

        pairRegistry.setActive(false);

        /*
         * New buying is disabled,
         * but existing holders
         * must still be able to exit.
         */
        vm.prank(investor);

        market.sell(3 ether, 0);

        assertEq(pairToken.totalSupply(), 0);

        assertEq(market.reserve(), 0);
    }

    function test_RevertIfPairDoesNotExist() public {
        vm.expectRevert(PairMarket.PairNotFound.selector);

        new PairMarket(address(pairRegistry), address(usdc), 999, "Ghost Pair", "GHOST");
    }

    function test_RevertIfPairInactiveAtDeployment() public {
        pairRegistry.setActive(false);

        vm.expectRevert(PairMarket.PairNotActive.selector);

        new PairMarket(address(pairRegistry), address(usdc), PAIR_ID, "Inactive Pair", "INACTIVE");
    }

    function test_BuyRevertsWhenMaxCostTooLow() public {
        /*
         * Buying 3 tokens costs $0.33.
         *
         * User only permits $0.329999.
         */
        assertEq(market.quoteBuy(3 ether), 330_000);

        vm.expectRevert(PairMarket.BuySlippageExceeded.selector);

        vm.prank(investor);

        market.buy(3 ether, 329_999);
    }

    function test_SellRevertsWhenMinRefundTooHigh() public {
        vm.prank(investor);

        market.buy(3 ether, 330_000);

        vm.prank(investor);

        pairToken.approve(address(market), type(uint256).max);

        /*
         * Selling one should return $0.12.
         */
        assertEq(market.quoteSell(1 ether), 120_000);

        /*
         * User requires at least $0.120001,
         * therefore the transaction must fail.
         */
        vm.expectRevert(PairMarket.SellSlippageExceeded.selector);

        vm.prank(investor);

        market.sell(1 ether, 120_001);

        /*
         * Failed sale changes nothing.
         */
        assertEq(pairToken.balanceOf(investor), 3 ether);

        assertEq(market.reserve(), 330_000);
    }
}
