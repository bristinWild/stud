// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {PairMarketFactory} from "../src/PairMarketFactory.sol";

import {PairMarket, IPairRegistryMarket} from "../src/PairMarket.sol";

import {PairToken} from "../src/PairToken.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract MockPairRegistryForFactory is IPairRegistryMarket {
    Pair private pair;

    constructor(address memberA_, address memberB_) {
        pair = Pair({
            id: 1, memberA: memberA_, memberB: memberB_, reputation: 0, createdAt: uint64(block.timestamp), active: true
        });
    }

    function getPair(uint256 pairId_) external view override returns (Pair memory) {
        if (pairId_ != pair.id) {
            return Pair({id: 0, memberA: address(0), memberB: address(0), reputation: 0, createdAt: 0, active: false});
        }

        return pair;
    }

    function setActive(bool active_) external {
        pair.active = active_;
    }
}

contract PairMarketFactoryTest is Test {
    uint256 internal constant PAIR_ID = 1;

    uint256 internal alicePk = 0xA11CE;

    uint256 internal bobPk = 0xB0B;

    uint256 internal outsiderPk = 0xDEAD;

    address internal alice;
    address internal bob;
    address internal outsider;

    MockPairRegistryForFactory internal pairRegistry;

    MockUSDC internal usdc;

    PairMarketFactory internal factory;

    function setUp() public {
        alice = vm.addr(alicePk);

        bob = vm.addr(bobPk);

        outsider = vm.addr(outsiderPk);

        pairRegistry = new MockPairRegistryForFactory(alice, bob);

        usdc = new MockUSDC();

        factory = new PairMarketFactory(address(pairRegistry), address(usdc));
    }

    function _signActivation(
        uint256 signerPk,
        uint256 pairId,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 deadline
    ) internal view returns (bytes memory) {
        bytes32 digest = factory.activationDigest(pairId, tokenName, tokenSymbol, deadline);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);

        return abi.encodePacked(r, s, v);
    }

    function _createMarket() internal returns (address) {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signActivation(bobPk, PAIR_ID, "Alice Leo", "ALICELEO", deadline);

        vm.prank(alice);

        return factory.createMarket(PAIR_ID, "Alice Leo", "ALICELEO", deadline, signature);
    }

    function test_StoresConfiguration() public view {
        assertEq(address(factory.pairRegistry()), address(pairRegistry));

        assertEq(factory.quoteToken(), address(usdc));
    }

    function test_BothMembersCanConsentToCreateMarket() public {
        address marketAddress = _createMarket();

        assertTrue(marketAddress != address(0));

        assertEq(factory.marketForPair(PAIR_ID), marketAddress);

        assertTrue(factory.hasMarket(PAIR_ID));
    }

    function test_CreatedMarketHasCorrectConfiguration() public {
        address marketAddress = _createMarket();

        PairMarket market = PairMarket(marketAddress);

        assertEq(market.pairId(), PAIR_ID);

        assertEq(address(market.pairRegistry()), address(pairRegistry));

        assertEq(address(market.quoteToken()), address(usdc));
    }

    function test_CreatedPairTokenHasCorrectMetadata() public {
        address marketAddress = _createMarket();

        PairMarket market = PairMarket(marketAddress);

        PairToken token = market.pairToken();

        assertEq(token.pairId(), PAIR_ID);

        assertEq(token.name(), "Alice Leo");

        assertEq(token.symbol(), "ALICELEO");

        assertEq(token.owner(), marketAddress);
    }

    function test_EitherPairMemberCanSubmitActivation() public {
        uint256 deadline = block.timestamp + 1 hours;

        /*
         * Bob submits the transaction,
         * so Alice signs consent.
         */
        bytes memory signature = _signActivation(alicePk, PAIR_ID, "Alice Leo", "ALICELEO", deadline);

        vm.prank(bob);

        address marketAddress = factory.createMarket(PAIR_ID, "Alice Leo", "ALICELEO", deadline, signature);

        assertTrue(marketAddress != address(0));

        assertTrue(factory.hasMarket(PAIR_ID));
    }

    function test_OutsiderCannotCreateMarket() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signActivation(bobPk, PAIR_ID, "Alice Leo", "ALICELEO", deadline);

        vm.expectRevert(PairMarketFactory.NotPairMember.selector);

        vm.prank(outsider);

        factory.createMarket(PAIR_ID, "Alice Leo", "ALICELEO", deadline, signature);
    }

    function test_WrongCounterpartySignatureReverts() public {
        uint256 deadline = block.timestamp + 1 hours;

        /*
         * Alice is caller.
         *
         * Bob must sign.
         *
         * Outsider signature is invalid.
         */
        bytes memory signature = _signActivation(outsiderPk, PAIR_ID, "Alice Leo", "ALICELEO", deadline);

        vm.expectRevert(PairMarketFactory.InvalidCounterpartySignature.selector);

        vm.prank(alice);

        factory.createMarket(PAIR_ID, "Alice Leo", "ALICELEO", deadline, signature);
    }

    function test_ExpiredAuthorizationReverts() public {
        uint256 deadline = block.timestamp + 10 minutes;

        bytes memory signature = _signActivation(bobPk, PAIR_ID, "Alice Leo", "ALICELEO", deadline);

        vm.warp(deadline + 1);

        vm.expectRevert(PairMarketFactory.AuthorizationExpired.selector);

        vm.prank(alice);

        factory.createMarket(PAIR_ID, "Alice Leo", "ALICELEO", deadline, signature);
    }

    function test_SignatureIsBoundToTokenMetadata() public {
        uint256 deadline = block.timestamp + 1 hours;

        /*
         * Bob signs ALICELEO.
         */
        bytes memory signature = _signActivation(bobPk, PAIR_ID, "Alice Leo", "ALICELEO", deadline);

        /*
         * Caller tries changing symbol
         * after Bob signed.
         */
        vm.expectRevert(PairMarketFactory.InvalidCounterpartySignature.selector);

        vm.prank(alice);

        factory.createMarket(PAIR_ID, "Alice Leo", "FAKETOKEN", deadline, signature);
    }

    function test_NonexistentPairCannotCreateMarket() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signActivation(bobPk, 999, "Ghost Pair", "GHOST", deadline);

        vm.expectRevert(PairMarketFactory.PairNotFound.selector);

        vm.prank(alice);

        factory.createMarket(999, "Ghost Pair", "GHOST", deadline, signature);
    }

    function test_InactivePairCannotCreateMarket() public {
        pairRegistry.setActive(false);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signActivation(bobPk, PAIR_ID, "Alice Leo", "ALICELEO", deadline);

        vm.expectRevert(PairMarketFactory.PairNotActive.selector);

        vm.prank(alice);

        factory.createMarket(PAIR_ID, "Alice Leo", "ALICELEO", deadline, signature);
    }

    function test_CannotCreateSecondMarketForSamePair() public {
        _createMarket();

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signActivation(bobPk, PAIR_ID, "Alice Leo 2", "ALICELEO2", deadline);

        vm.expectRevert(PairMarketFactory.MarketAlreadyExists.selector);

        vm.prank(alice);

        factory.createMarket(PAIR_ID, "Alice Leo 2", "ALICELEO2", deadline, signature);
    }

    function test_EmptyTokenNameReverts() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signActivation(bobPk, PAIR_ID, "", "ALICELEO", deadline);

        vm.expectRevert(PairMarketFactory.EmptyTokenName.selector);

        vm.prank(alice);

        factory.createMarket(PAIR_ID, "", "ALICELEO", deadline, signature);
    }

    function test_EmptyTokenSymbolReverts() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signActivation(bobPk, PAIR_ID, "Alice Leo", "", deadline);

        vm.expectRevert(PairMarketFactory.EmptyTokenSymbol.selector);

        vm.prank(alice);

        factory.createMarket(PAIR_ID, "Alice Leo", "", deadline, signature);
    }
}
