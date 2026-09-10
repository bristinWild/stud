// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {StudPredictionMarket} from "../src/StudPredictionMarket.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract MockStudRegistry {
    mapping(address => bool) private verified;
    mapping(address => uint256) private studIds;

    function setStud(address wallet, uint256 studId, bool isVerified) external {
        verified[wallet] = isVerified;
        studIds[wallet] = studId;
    }

    function isVerifiedStud(address wallet) external view returns (bool) {
        return verified[wallet];
    }

    function getStudId(address wallet) external view returns (uint256) {
        return studIds[wallet];
    }
}

contract StudPredictionMarketTest is Test {
    uint256 internal constant USDC_UNIT = 1e6;

    MockStudRegistry internal studRegistry;
    MockUSDC internal usdc;

    StudPredictionMarket internal market;

    address internal subject = makeAddr("alice");

    address internal resolver = makeAddr("resolver");

    address internal yesTrader = makeAddr("yesTrader");

    address internal secondYesTrader = makeAddr("secondYesTrader");

    address internal noTrader = makeAddr("noTrader");

    address internal outsider = makeAddr("outsider");

    uint64 internal closesAt;

    string internal constant QUESTION = "Will Alice complete 3 verified milestones before Oct 1?";

    function setUp() public {
        studRegistry = new MockStudRegistry();

        studRegistry.setStud(subject, 1, true);

        usdc = new MockUSDC();

        closesAt = uint64(block.timestamp + 1 days);

        market = new StudPredictionMarket(address(studRegistry), address(usdc), subject, QUESTION, closesAt, resolver);

        _fundAndApprove(yesTrader);

        _fundAndApprove(secondYesTrader);

        _fundAndApprove(noTrader);

        _fundAndApprove(outsider);
    }

    function test_StoresConfiguration() public view {
        assertEq(address(market.studRegistry()), address(studRegistry));

        assertEq(address(market.quoteToken()), address(usdc));

        assertEq(market.subject(), subject);

        assertEq(market.studId(), 1);

        assertEq(market.resolver(), resolver);

        assertEq(market.question(), QUESTION);

        assertEq(market.closesAt(), closesAt);

        assertEq(uint256(market.outcome()), uint256(StudPredictionMarket.Outcome.Unresolved));
    }

    function test_StartsFiftyFifty() public view {
        assertEq(market.yesProbabilityBps(), 5_000);

        assertEq(market.noProbabilityBps(), 5_000);

        assertEq(market.totalPool(), 0);
    }

    function test_TakeYesUpdatesPoolAndPosition() public {
        vm.prank(yesTrader);

        market.takeYes(100 * USDC_UNIT);

        assertEq(market.yesPool(), 100 * USDC_UNIT);

        assertEq(market.yesPositions(yesTrader), 100 * USDC_UNIT);

        assertEq(market.totalPool(), 100 * USDC_UNIT);

        assertEq(usdc.balanceOf(address(market)), 100 * USDC_UNIT);
    }

    function test_TakeNoUpdatesPoolAndPosition() public {
        vm.prank(noTrader);

        market.takeNo(75 * USDC_UNIT);

        assertEq(market.noPool(), 75 * USDC_UNIT);

        assertEq(market.noPositions(noTrader), 75 * USDC_UNIT);

        assertEq(market.totalPool(), 75 * USDC_UNIT);
    }

    function test_ProbabilityReflectsPools() public {
        vm.prank(yesTrader);

        market.takeYes(75 * USDC_UNIT);

        vm.prank(noTrader);

        market.takeNo(25 * USDC_UNIT);

        assertEq(market.yesProbabilityBps(), 7_500);

        assertEq(market.noProbabilityBps(), 2_500);
    }

    function test_CannotBetZero() public {
        vm.expectRevert(StudPredictionMarket.InvalidAmount.selector);

        vm.prank(yesTrader);

        market.takeYes(0);
    }

    function test_CannotBetAfterClose() public {
        vm.warp(closesAt);

        vm.expectRevert(StudPredictionMarket.MarketClosed.selector);

        vm.prank(yesTrader);

        market.takeYes(100 * USDC_UNIT);
    }

    function test_CannotResolveBeforeClose() public {
        vm.expectRevert(StudPredictionMarket.MarketStillOpen.selector);

        vm.prank(resolver);

        market.resolve(StudPredictionMarket.Outcome.Yes);
    }

    function test_OnlyResolverCanResolve() public {
        vm.warp(closesAt);

        vm.expectRevert(StudPredictionMarket.UnauthorizedResolver.selector);

        vm.prank(outsider);

        market.resolve(StudPredictionMarket.Outcome.Yes);
    }

    function test_CannotResolveToUnresolved() public {
        vm.warp(closesAt);

        vm.expectRevert(StudPredictionMarket.InvalidOutcome.selector);

        vm.prank(resolver);

        market.resolve(StudPredictionMarket.Outcome.Unresolved);
    }

    function test_CannotResolveTwice() public {
        vm.warp(closesAt);

        vm.prank(resolver);

        market.resolve(StudPredictionMarket.Outcome.Yes);

        vm.expectRevert(StudPredictionMarket.AlreadyResolved.selector);

        vm.prank(resolver);

        market.resolve(StudPredictionMarket.Outcome.No);
    }

    function test_CannotClaimBeforeResolution() public {
        vm.prank(yesTrader);

        market.takeYes(100 * USDC_UNIT);

        vm.expectRevert(StudPredictionMarket.MarketNotResolved.selector);

        vm.prank(yesTrader);

        market.claim();
    }

    function test_YesWinnersReceiveProportionalPool() public {
        /*
         * YES:
         * Trader 1 = $100
         * Trader 2 = $300
         *
         * NO:
         * Trader = $600
         *
         * Total pool = $1,000
         * Winning pool = $400
         *
         * Trader 1 receives:
         * 100 / 400 * 1000 = $250
         *
         * Trader 2 receives:
         * 300 / 400 * 1000 = $750
         */

        vm.prank(yesTrader);

        market.takeYes(100 * USDC_UNIT);

        vm.prank(secondYesTrader);

        market.takeYes(300 * USDC_UNIT);

        vm.prank(noTrader);

        market.takeNo(600 * USDC_UNIT);

        assertEq(market.yesPool(), 400 * USDC_UNIT);

        assertEq(market.noPool(), 600 * USDC_UNIT);

        assertEq(market.totalPool(), 1_000 * USDC_UNIT);

        vm.warp(closesAt);

        vm.prank(resolver);

        market.resolve(StudPredictionMarket.Outcome.Yes);

        vm.prank(yesTrader);

        market.claim();

        assertEq(usdc.balanceOf(yesTrader), 1_150 * USDC_UNIT);

        vm.prank(secondYesTrader);

        market.claim();

        assertEq(usdc.balanceOf(secondYesTrader), 1_450 * USDC_UNIT);

        assertEq(usdc.balanceOf(address(market)), 0);
    }

    function test_LoserCannotClaim() public {
        vm.prank(yesTrader);

        market.takeYes(100 * USDC_UNIT);

        vm.prank(noTrader);

        market.takeNo(100 * USDC_UNIT);

        vm.warp(closesAt);

        vm.prank(resolver);

        market.resolve(StudPredictionMarket.Outcome.Yes);

        vm.expectRevert(StudPredictionMarket.NothingToClaim.selector);

        vm.prank(noTrader);

        market.claim();
    }

    function test_CannotClaimTwice() public {
        vm.prank(yesTrader);

        market.takeYes(100 * USDC_UNIT);

        vm.prank(noTrader);

        market.takeNo(100 * USDC_UNIT);

        vm.warp(closesAt);

        vm.prank(resolver);

        market.resolve(StudPredictionMarket.Outcome.Yes);

        vm.prank(yesTrader);

        market.claim();

        vm.expectRevert(StudPredictionMarket.AlreadyClaimed.selector);

        vm.prank(yesTrader);

        market.claim();
    }

    function test_NoWinningBettorsRefundsStake() public {
        /*
         * Only YES receives bets.
         * Final outcome is NO.
         *
         * Since nobody backed NO,
         * there is no winning pool.
         *
         * The user's original stake
         * should therefore be refunded.
         */

        uint256 startingBalance = usdc.balanceOf(yesTrader);

        vm.prank(yesTrader);

        market.takeYes(125 * USDC_UNIT);

        assertEq(usdc.balanceOf(yesTrader), startingBalance - (125 * USDC_UNIT));

        assertEq(market.noPool(), 0);

        vm.warp(closesAt);

        vm.prank(resolver);

        market.resolve(StudPredictionMarket.Outcome.No);

        vm.prank(yesTrader);

        market.claim();

        assertEq(usdc.balanceOf(yesTrader), startingBalance);

        assertTrue(market.claimed(yesTrader));

        assertEq(usdc.balanceOf(address(market)), 0);
    }

    function _fundAndApprove(address user) internal {
        usdc.mint(user, 1_000 * USDC_UNIT);

        vm.prank(user);

        usdc.approve(address(market), type(uint256).max);
    }
}
