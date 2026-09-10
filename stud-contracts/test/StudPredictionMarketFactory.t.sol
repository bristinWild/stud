// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {StudPredictionMarket} from "../src/StudPredictionMarket.sol";

import {StudPredictionMarketFactory} from "../src/StudPredictionMarketFactory.sol";

import {MockUSDC} from "../src/MockUSDC.sol";

contract MockStudRegistryForFactory {
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

contract StudPredictionMarketFactoryTest is Test {
    MockStudRegistryForFactory internal studRegistry;

    MockUSDC internal usdc;

    StudPredictionMarketFactory internal factory;

    address internal marketCreator = makeAddr("marketCreator");

    address internal resolver = makeAddr("resolver");

    address internal alice = makeAddr("alice");

    address internal bob = makeAddr("bob");

    address internal outsider = makeAddr("outsider");

    uint64 internal closesAt;

    string internal constant QUESTION = "Will Alice complete 3 verified milestones before Oct 1?";

    function setUp() public {
        studRegistry = new MockStudRegistryForFactory();

        studRegistry.setStud(alice, 1, true);

        studRegistry.setStud(bob, 2, true);

        usdc = new MockUSDC();

        closesAt = uint64(block.timestamp + 1 days);

        factory = new StudPredictionMarketFactory(address(studRegistry), address(usdc), marketCreator, resolver);
    }

    function test_StoresConfiguration() public view {
        assertEq(address(factory.studRegistry()), address(studRegistry));

        assertEq(factory.quoteToken(), address(usdc));

        assertEq(factory.marketCreator(), marketCreator);

        assertEq(factory.resolver(), resolver);

        assertEq(factory.nextMarketId(), 1);

        assertEq(factory.marketCount(), 0);
    }

    function test_RevertIfStudRegistryZero() public {
        vm.expectRevert(StudPredictionMarketFactory.InvalidStudRegistry.selector);

        new StudPredictionMarketFactory(address(0), address(usdc), marketCreator, resolver);
    }

    function test_RevertIfQuoteTokenZero() public {
        vm.expectRevert(StudPredictionMarketFactory.InvalidQuoteToken.selector);

        new StudPredictionMarketFactory(address(studRegistry), address(0), marketCreator, resolver);
    }

    function test_RevertIfCreatorZero() public {
        vm.expectRevert(StudPredictionMarketFactory.InvalidCreator.selector);

        new StudPredictionMarketFactory(address(studRegistry), address(usdc), address(0), resolver);
    }

    function test_RevertIfResolverZero() public {
        vm.expectRevert(StudPredictionMarketFactory.InvalidResolver.selector);

        new StudPredictionMarketFactory(address(studRegistry), address(usdc), marketCreator, address(0));
    }

    function test_OnlyCreatorCanCreateMarket() public {
        vm.expectRevert(StudPredictionMarketFactory.UnauthorizedCreator.selector);

        vm.prank(outsider);

        factory.createMarket(alice, QUESTION, closesAt);
    }

    function test_RevertIfSubjectZero() public {
        vm.expectRevert(StudPredictionMarketFactory.InvalidSubject.selector);

        vm.prank(marketCreator);

        factory.createMarket(address(0), QUESTION, closesAt);
    }

    function test_RevertIfSubjectNotVerified() public {
        address unverified = makeAddr("unverified");

        vm.expectRevert(StudPredictionMarketFactory.SubjectNotVerifiedStud.selector);

        vm.prank(marketCreator);

        factory.createMarket(unverified, QUESTION, closesAt);
    }

    function test_RevertIfQuestionEmpty() public {
        vm.expectRevert(StudPredictionMarketFactory.EmptyQuestion.selector);

        vm.prank(marketCreator);

        factory.createMarket(alice, "", closesAt);
    }

    function test_RevertIfCloseTimeNotFuture() public {
        vm.expectRevert(StudPredictionMarketFactory.InvalidCloseTime.selector);

        vm.prank(marketCreator);

        factory.createMarket(alice, QUESTION, uint64(block.timestamp));
    }

    function test_CreateMarketTracksMarket() public {
        vm.prank(marketCreator);

        address market = factory.createMarket(alice, QUESTION, closesAt);

        assertTrue(market != address(0));

        assertEq(factory.marketForId(1), market);

        assertEq(factory.idForMarket(market), 1);

        assertEq(factory.nextMarketId(), 2);

        assertEq(factory.marketCount(), 1);

        address[] memory markets = factory.getMarketsByStudId(1);

        assertEq(markets.length, 1);

        assertEq(markets[0], market);
    }

    function test_CreatedMarketHasCorrectConfiguration() public {
        vm.prank(marketCreator);

        address marketAddress = factory.createMarket(alice, QUESTION, closesAt);

        StudPredictionMarket market = StudPredictionMarket(marketAddress);

        assertEq(address(market.studRegistry()), address(studRegistry));

        assertEq(address(market.quoteToken()), address(usdc));

        assertEq(market.subject(), alice);

        assertEq(market.studId(), 1);

        assertEq(market.resolver(), resolver);

        assertEq(market.question(), QUESTION);

        assertEq(market.closesAt(), closesAt);
    }

    function test_MultipleMarketsForSameStud() public {
        vm.startPrank(marketCreator);

        address firstMarket = factory.createMarket(alice, "Will Alice reach reputation 20?", closesAt);

        address secondMarket = factory.createMarket(alice, "Will Alice reach reputation 50?", uint64(closesAt + 1 days));

        vm.stopPrank();

        address[] memory markets = factory.getMarketsByStudId(1);

        assertEq(markets.length, 2);

        assertEq(markets[0], firstMarket);

        assertEq(markets[1], secondMarket);

        assertEq(factory.marketForId(1), firstMarket);

        assertEq(factory.marketForId(2), secondMarket);

        assertEq(factory.marketCount(), 2);
    }

    function test_MarketsAreSeparatedByStud() public {
        vm.startPrank(marketCreator);

        address aliceMarket = factory.createMarket(alice, QUESTION, closesAt);

        address bobMarket = factory.createMarket(bob, "Will Bob complete 5 verified milestones?", closesAt);

        vm.stopPrank();

        address[] memory aliceMarkets = factory.getMarketsByStudId(1);

        address[] memory bobMarkets = factory.getMarketsByStudId(2);

        assertEq(aliceMarkets.length, 1);

        assertEq(bobMarkets.length, 1);

        assertEq(aliceMarkets[0], aliceMarket);

        assertEq(bobMarkets[0], bobMarket);
    }

    function test_MarketIdsIncrement() public {
        vm.startPrank(marketCreator);

        address first = factory.createMarket(alice, "Question one", closesAt);

        address second = factory.createMarket(bob, "Question two", closesAt);

        vm.stopPrank();

        assertEq(factory.idForMarket(first), 1);

        assertEq(factory.idForMarket(second), 2);

        assertEq(factory.nextMarketId(), 3);
    }
}
