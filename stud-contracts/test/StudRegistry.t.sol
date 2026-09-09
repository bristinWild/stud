// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {StudRegistry} from "../src/StudRegistry.sol";

contract StudRegistryTest is Test {
    StudRegistry registry;

    uint256 private verifierPrivateKey = 0xA11CE;

    address private verifierSigner;

    address private alice = makeAddr("alice");

    address private leo = makeAddr("leo");

    bytes32 private aliceNullifier = keccak256("alice-world-id-nullifier");

    bytes32 private leoNullifier = keccak256("leo-world-id-nullifier");

    function setUp() public {
        verifierSigner = vm.addr(verifierPrivateKey);

        registry = new StudRegistry(verifierSigner);
    }

    function _signRegistration(address wallet, bytes32 nullifierHash, uint256 deadline, uint256 signerPrivateKey)
        internal
        returns (bytes memory)
    {
        bytes32 digest = registry.registrationDigest(wallet, nullifierHash, deadline);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, digest);

        return abi.encodePacked(r, s, v);
    }

    function test_RegisterStudWithValidAuthorization() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signRegistration(alice, aliceNullifier, deadline, verifierPrivateKey);

        vm.prank(alice);

        uint256 studId = registry.registerStud(aliceNullifier, deadline, signature);

        assertEq(studId, 1);

        assertTrue(registry.isVerifiedStud(alice));

        assertTrue(registry.isNullifierUsed(aliceNullifier));
    }

    function test_StoresStudInformation() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signRegistration(alice, aliceNullifier, deadline, verifierPrivateKey);

        vm.prank(alice);

        registry.registerStud(aliceNullifier, deadline, signature);

        StudRegistry.Stud memory stud = registry.getStud(alice);

        assertEq(stud.id, 1);
        assertEq(stud.wallet, alice);
        assertTrue(stud.verified);

        assertEq(stud.registeredAt, block.timestamp);
    }

    function test_AssignsDifferentStudIds() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory aliceSignature = _signRegistration(alice, aliceNullifier, deadline, verifierPrivateKey);

        bytes memory leoSignature = _signRegistration(leo, leoNullifier, deadline, verifierPrivateKey);

        vm.prank(alice);

        uint256 aliceId = registry.registerStud(aliceNullifier, deadline, aliceSignature);

        vm.prank(leo);

        uint256 leoId = registry.registerStud(leoNullifier, deadline, leoSignature);

        assertEq(aliceId, 1);
        assertEq(leoId, 2);
    }

    function test_RevertIfAlreadyRegistered() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signRegistration(alice, aliceNullifier, deadline, verifierPrivateKey);

        vm.prank(alice);

        registry.registerStud(aliceNullifier, deadline, signature);

        vm.prank(alice);

        vm.expectRevert(StudRegistry.AlreadyRegistered.selector);

        registry.registerStud(aliceNullifier, deadline, signature);
    }

    function test_RevertIfNullifierUsedByAnotherWallet() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory aliceSignature = _signRegistration(alice, aliceNullifier, deadline, verifierPrivateKey);

        vm.prank(alice);

        registry.registerStud(aliceNullifier, deadline, aliceSignature);

        // Backend signs another authorization
        // using Alice's already-used World ID nullifier.
        bytes memory leoSignature = _signRegistration(leo, aliceNullifier, deadline, verifierPrivateKey);

        vm.prank(leo);

        vm.expectRevert(StudRegistry.NullifierAlreadyUsed.selector);

        registry.registerStud(aliceNullifier, deadline, leoSignature);
    }

    function test_RevertWithWrongSigner() public {
        uint256 attackerPrivateKey = 0xB0B;

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory badSignature = _signRegistration(alice, aliceNullifier, deadline, attackerPrivateKey);

        vm.prank(alice);

        vm.expectRevert(StudRegistry.InvalidAuthorization.selector);

        registry.registerStud(aliceNullifier, deadline, badSignature);
    }

    function test_RevertIfSignatureUsedByDifferentWallet() public {
        uint256 deadline = block.timestamp + 1 hours;

        // Signature specifically authorizes Alice.
        bytes memory aliceSignature = _signRegistration(alice, aliceNullifier, deadline, verifierPrivateKey);

        // Leo tries to steal Alice's authorization.
        vm.prank(leo);

        vm.expectRevert(StudRegistry.InvalidAuthorization.selector);

        registry.registerStud(aliceNullifier, deadline, aliceSignature);
    }

    function test_RevertIfAuthorizationExpired() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes memory signature = _signRegistration(alice, aliceNullifier, deadline, verifierPrivateKey);

        vm.warp(deadline + 1);

        vm.prank(alice);

        vm.expectRevert(StudRegistry.AuthorizationExpired.selector);

        registry.registerStud(aliceNullifier, deadline, signature);
    }

    function test_RevertWithZeroNullifier() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 zeroNullifier = bytes32(0);

        bytes memory signature = _signRegistration(alice, zeroNullifier, deadline, verifierPrivateKey);

        vm.prank(alice);

        vm.expectRevert(StudRegistry.InvalidNullifier.selector);

        registry.registerStud(zeroNullifier, deadline, signature);
    }

    function test_UnregisteredWalletIsNotVerified() public view {
        assertFalse(registry.isVerifiedStud(alice));
    }
}
