// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {PairToken} from "../src/PairToken.sol";

contract PairTokenTest is Test {
    PairToken internal token;

    address internal controller = address(0xCAFE);

    address internal investor = address(0xBEEF);

    address internal outsider = address(0xDEAD);

    uint256 internal constant PAIR_ID = 1;

    function setUp() public {
        token = new PairToken("Alice Leo", "ALICELEO", PAIR_ID, controller);
    }

    function test_StoresPairId() public view {
        assertEq(token.pairId(), PAIR_ID);
    }

    function test_StoresNameAndSymbol() public view {
        assertEq(token.name(), "Alice Leo");

        assertEq(token.symbol(), "ALICELEO");
    }

    function test_ControllerIsOwner() public view {
        assertEq(token.owner(), controller);
    }

    function test_StartsWithZeroSupply() public view {
        assertEq(token.totalSupply(), 0);
    }

    function test_OwnerCanMint() public {
        uint256 amount = 100 ether;

        vm.prank(controller);

        token.mint(investor, amount);

        assertEq(token.balanceOf(investor), amount);

        assertEq(token.totalSupply(), amount);
    }

    function test_NonOwnerCannotMint() public {
        vm.prank(outsider);

        vm.expectRevert();

        token.mint(outsider, 100 ether);
    }

    function test_InvestorCanTransferTokens() public {
        uint256 amount = 100 ether;

        vm.prank(controller);

        token.mint(investor, amount);

        vm.prank(investor);

        assertTrue(token.transfer(outsider, 40 ether));

        assertEq(token.balanceOf(investor), 60 ether);

        assertEq(token.balanceOf(outsider), 40 ether);
    }

    function test_OwnerCanBurnTokensItHolds() public {
        uint256 amount = 100 ether;

        /*
         * Mint tokens directly to the controller.
         *
         * Later PairMarket will first receive tokens
         * from the seller and then burn them.
         */
        vm.prank(controller);

        token.mint(controller, amount);

        assertEq(token.totalSupply(), amount);

        vm.prank(controller);

        token.burn(40 ether);

        assertEq(token.balanceOf(controller), 60 ether);

        assertEq(token.totalSupply(), 60 ether);
    }

    function test_NonOwnerCannotBurn() public {
        vm.prank(controller);

        token.mint(outsider, 100 ether);

        vm.prank(outsider);

        vm.expectRevert();

        token.burn(50 ether);

        assertEq(token.balanceOf(outsider), 100 ether);
    }

    function test_RevertIfPairIdIsZero() public {
        vm.expectRevert(PairToken.InvalidPairId.selector);

        new PairToken("Invalid Pair", "INVALID", 0, controller);
    }
}
