// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {StudRegistry} from "../src/StudRegistry.sol";
import {PairRegistry} from "../src/PairRegistry.sol";

contract PairRegistryTest is Test {
    StudRegistry studRegistry;
    PairRegistry pairRegistry;

    uint256 private verifierPrivateKey = 0xA11CE;
    uint256 private pairSignerPrivateKey = 0xB0B;
    uint256 private attackerPrivateKey = 0xBAD;

    address private verifierSigner;
    address private pairSigner;

    address private alice = makeAddr("alice");
    address private leo = makeAddr("leo");
    address private noah = makeAddr("noah");

    bytes32 private aliceNullifier = keccak256("alice-world-id");

    bytes32 private leoNullifier = keccak256("leo-world-id");

    bytes32 private noahNullifier = keccak256("noah-world-id");

    function setUp() public {
        verifierSigner = vm.addr(verifierPrivateKey);

        pairSigner = vm.addr(pairSignerPrivateKey);

        studRegistry = new StudRegistry(verifierSigner);

        pairRegistry = new PairRegistry(address(studRegistry), pairSigner);
    }

    /*//////////////////////////////////////////////////////////////
                          STUD HELPERS
    //////////////////////////////////////////////////////////////*/

    function _registerStud(address wallet, bytes32 nullifier) internal {
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 digest = studRegistry.registrationDigest(wallet, nullifier, deadline);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPrivateKey, digest);

        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(wallet);

        studRegistry.registerStud(nullifier, deadline, signature);
    }

    /*//////////////////////////////////////////////////////////////
                          PAIR HELPERS
    //////////////////////////////////////////////////////////////*/

    function _signPair(address memberA, address memberB, uint256 deadline, uint256 signerPrivateKey)
        internal
        view
        returns (bytes32 digest)
    {
        return pairRegistry.creationDigest(memberA, memberB, deadline);
    }

    function _signatureForPair(address memberA, address memberB, uint256 deadline, uint256 signerPrivateKey)
        internal
        returns (bytes memory)
    {
        bytes32 digest = _signPair(memberA, memberB, deadline, signerPrivateKey);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, digest);

        return abi.encodePacked(r, s, v);
    }

    /*//////////////////////////////////////////////////////////////
                              TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreatePair() public {
        _registerStud(alice, aliceNullifier);

        _registerStud(leo, leoNullifier);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signatureForPair(alice, leo, deadline, pairSignerPrivateKey);

        vm.prank(alice);

        uint256 pairId = pairRegistry.createPair(leo, deadline, signature);

        assertEq(pairId, 1);
    }

    function test_PairStartsWithZeroReputation() public {
        _registerStud(alice, aliceNullifier);

        _registerStud(leo, leoNullifier);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signatureForPair(alice, leo, deadline, pairSignerPrivateKey);

        vm.prank(alice);

        uint256 pairId = pairRegistry.createPair(leo, deadline, signature);

        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        assertEq(pair.id, 1);

        assertEq(pair.reputation, 0);

        assertTrue(pair.active);

        assertEq(pair.createdAt, block.timestamp);
    }

    function test_PairStoresBothMembers() public {
        _registerStud(alice, aliceNullifier);

        _registerStud(leo, leoNullifier);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signatureForPair(alice, leo, deadline, pairSignerPrivateKey);

        vm.prank(alice);

        uint256 pairId = pairRegistry.createPair(leo, deadline, signature);

        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        /*
         * PairRegistry sorts member addresses,
         * so don't assume Alice is always memberA.
         */
        bool correctMembers =
            (pair.memberA == alice && pair.memberB == leo) || (pair.memberA == leo && pair.memberB == alice);

        assertTrue(correctMembers);
    }

    function test_GetPairIdWorksInBothDirections() public {
        _registerStud(alice, aliceNullifier);

        _registerStud(leo, leoNullifier);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signatureForPair(alice, leo, deadline, pairSignerPrivateKey);

        vm.prank(alice);

        pairRegistry.createPair(leo, deadline, signature);

        assertEq(pairRegistry.getPairId(alice, leo), 1);

        assertEq(pairRegistry.getPairId(leo, alice), 1);
    }

    function test_RevertIfOtherMemberNotVerified() public {
        _registerStud(alice, aliceNullifier);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signatureForPair(alice, noah, deadline, pairSignerPrivateKey);

        vm.prank(alice);

        vm.expectRevert(PairRegistry.UnverifiedStud.selector);

        pairRegistry.createPair(noah, deadline, signature);
    }

    function test_RevertIfSameMember() public {
        _registerStud(alice, aliceNullifier);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signatureForPair(alice, alice, deadline, pairSignerPrivateKey);

        vm.prank(alice);

        vm.expectRevert(PairRegistry.SameMember.selector);

        pairRegistry.createPair(alice, deadline, signature);
    }

    function test_RevertWithWrongSigner() public {
        _registerStud(alice, aliceNullifier);

        _registerStud(leo, leoNullifier);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signatureForPair(alice, leo, deadline, attackerPrivateKey);

        vm.prank(alice);

        vm.expectRevert(PairRegistry.InvalidAuthorization.selector);

        pairRegistry.createPair(leo, deadline, signature);
    }

    function test_RevertIfAuthorizationExpired() public {
        _registerStud(alice, aliceNullifier);

        _registerStud(leo, leoNullifier);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signatureForPair(alice, leo, deadline, pairSignerPrivateKey);

        vm.warp(deadline + 1);

        vm.prank(alice);

        vm.expectRevert(PairRegistry.AuthorizationExpired.selector);

        pairRegistry.createPair(leo, deadline, signature);
    }

    function test_RevertIfPairAlreadyExists() public {
        _registerStud(alice, aliceNullifier);

        _registerStud(leo, leoNullifier);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signatureForPair(alice, leo, deadline, pairSignerPrivateKey);

        vm.prank(alice);

        pairRegistry.createPair(leo, deadline, signature);

        vm.prank(alice);

        vm.expectRevert(PairRegistry.PairAlreadyExists.selector);

        pairRegistry.createPair(leo, deadline, signature);
    }

    function test_RevertDuplicatePairInReverseOrder() public {
        _registerStud(alice, aliceNullifier);

        _registerStud(leo, leoNullifier);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signatureForPair(alice, leo, deadline, pairSignerPrivateKey);

        vm.prank(alice);

        pairRegistry.createPair(leo, deadline, signature);

        /*
         * Because the addresses are sorted
         * before hashing/signing, Leo + Alice
         * is the same Pair as Alice + Leo.
         */
        vm.prank(leo);

        vm.expectRevert(PairRegistry.PairAlreadyExists.selector);

        pairRegistry.createPair(alice, deadline, signature);
    }
}
