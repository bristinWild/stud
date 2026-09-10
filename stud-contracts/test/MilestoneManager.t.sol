// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {StudRegistry} from "../src/StudRegistry.sol";
import {PairRegistry} from "../src/PairRegistry.sol";
import {MilestoneManager} from "../src/MilestoneManager.sol";

contract MilestoneManagerTest is Test {
    StudRegistry private studRegistry;
    PairRegistry private pairRegistry;
    MilestoneManager private milestoneManager;

    uint256 private verifierPrivateKey = 0xA11CE;
    uint256 private pairSignerPrivateKey = 0xB0B;

    address private verifierSigner;
    address private pairSigner;

    address private alice = makeAddr("alice");
    address private leo = makeAddr("leo");
    address private outsider = makeAddr("outsider");

    bytes32 private aliceNullifier = keccak256("alice-world-id");

    bytes32 private leoNullifier = keccak256("leo-world-id");

    uint256 private pairId;

    function setUp() public {
        verifierSigner = vm.addr(verifierPrivateKey);

        pairSigner = vm.addr(pairSignerPrivateKey);

        /*
         * 1. Deploy StudRegistry
         */
        studRegistry = new StudRegistry(verifierSigner);

        /*
         * 2. Deploy PairRegistry
         */
        pairRegistry = new PairRegistry(address(studRegistry), pairSigner);

        /*
         * 3. Deploy MilestoneManager
         */
        milestoneManager = new MilestoneManager(address(pairRegistry));

        /*
         * 4. Authorize MilestoneManager
         *    inside PairRegistry.
         */
        pairRegistry.setMilestoneManager(address(milestoneManager));

        /*
         * 5. Register Alice + Leo
         *    as verified Studs.
         */
        _registerStud(alice, aliceNullifier);

        _registerStud(leo, leoNullifier);

        /*
         * 6. Create their Pair.
         */
        pairId = _createPair(alice, leo);
    }

    function _registerStud(address wallet, bytes32 nullifier) internal {
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 digest = studRegistry.registrationDigest(wallet, nullifier, deadline);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierPrivateKey, digest);

        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(wallet);

        studRegistry.registerStud(nullifier, deadline, signature);
    }

    function _createPair(address firstMember, address secondMember) internal returns (uint256) {
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 digest = pairRegistry.creationDigest(firstMember, secondMember, deadline);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pairSignerPrivateKey, digest);

        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(firstMember);

        return pairRegistry.createPair(secondMember, deadline, signature);
    }

    function _proposeMilestone() internal returns (uint256) {
        vm.prank(outsider);

        return milestoneManager.proposeMilestone(pairId, "Complete first video call");
    }

    function _activateMilestone(uint256 milestoneId) internal {
        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        vm.prank(pair.memberA);

        milestoneManager.acceptMilestone(milestoneId);

        vm.prank(pair.memberB);

        milestoneManager.acceptMilestone(milestoneId);
    }

    function _completeMilestone(uint256 milestoneId) internal {
        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        vm.prank(pair.memberA);

        milestoneManager.attestCompletion(milestoneId);

        vm.prank(pair.memberB);

        milestoneManager.attestCompletion(milestoneId);
    }

    function test_AnyoneCanProposeMilestone() public {
        uint256 milestoneId = _proposeMilestone();

        MilestoneManager.Milestone memory milestone = milestoneManager.getMilestone(milestoneId);

        assertEq(milestone.id, 1);

        assertEq(milestone.pairId, pairId);

        assertEq(milestone.proposer, outsider);

        assertEq(milestone.title, "Complete first video call");

        assertEq(uint256(milestone.status), uint256(MilestoneManager.MilestoneStatus.Proposed));
    }

    function test_RevertIfPairDoesNotExist() public {
        vm.expectRevert(MilestoneManager.PairNotFound.selector);

        milestoneManager.proposeMilestone(999, "Fake milestone");
    }

    function test_RevertIfTitleIsEmpty() public {
        vm.expectRevert(MilestoneManager.EmptyTitle.selector);

        milestoneManager.proposeMilestone(pairId, "");
    }

    function test_FirstAcceptanceDoesNotActivate() public {
        uint256 milestoneId = _proposeMilestone();

        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        vm.prank(pair.memberA);

        milestoneManager.acceptMilestone(milestoneId);

        MilestoneManager.Milestone memory milestone = milestoneManager.getMilestone(milestoneId);

        assertEq(uint256(milestone.status), uint256(MilestoneManager.MilestoneStatus.Proposed));

        assertTrue(milestone.memberAAccepted);

        assertFalse(milestone.memberBAccepted);
    }

    function test_BothMembersActivateMilestone() public {
        uint256 milestoneId = _proposeMilestone();

        _activateMilestone(milestoneId);

        MilestoneManager.Milestone memory milestone = milestoneManager.getMilestone(milestoneId);

        assertEq(uint256(milestone.status), uint256(MilestoneManager.MilestoneStatus.Active));

        assertTrue(milestone.memberAAccepted);

        assertTrue(milestone.memberBAccepted);

        assertGt(milestone.activatedAt, 0);
    }

    function test_OutsiderCannotAccept() public {
        uint256 milestoneId = _proposeMilestone();

        vm.prank(outsider);

        vm.expectRevert(MilestoneManager.NotPairMember.selector);

        milestoneManager.acceptMilestone(milestoneId);
    }

    function test_MemberCannotAcceptTwice() public {
        uint256 milestoneId = _proposeMilestone();

        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        vm.prank(pair.memberA);

        milestoneManager.acceptMilestone(milestoneId);

        vm.prank(pair.memberA);

        vm.expectRevert(MilestoneManager.AlreadyAccepted.selector);

        milestoneManager.acceptMilestone(milestoneId);
    }

    function test_CannotAttestBeforeActivation() public {
        uint256 milestoneId = _proposeMilestone();

        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        vm.prank(pair.memberA);

        vm.expectRevert(MilestoneManager.MilestoneNotActive.selector);

        milestoneManager.attestCompletion(milestoneId);
    }

    function test_FirstAttestationDoesNotComplete() public {
        uint256 milestoneId = _proposeMilestone();

        _activateMilestone(milestoneId);

        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        vm.prank(pair.memberA);

        milestoneManager.attestCompletion(milestoneId);

        MilestoneManager.Milestone memory milestone = milestoneManager.getMilestone(milestoneId);

        assertEq(uint256(milestone.status), uint256(MilestoneManager.MilestoneStatus.Active));

        /*
         * No reputation yet.
         */
        PairRegistry.Pair memory updatedPair = pairRegistry.getPair(pairId);

        assertEq(updatedPair.reputation, 0);
    }

    function test_OutsiderCannotAttest() public {
        uint256 milestoneId = _proposeMilestone();

        _activateMilestone(milestoneId);

        vm.prank(outsider);

        vm.expectRevert(MilestoneManager.NotPairMember.selector);

        milestoneManager.attestCompletion(milestoneId);
    }

    function test_BothAttestCompletesMilestone() public {
        uint256 milestoneId = _proposeMilestone();

        _activateMilestone(milestoneId);

        _completeMilestone(milestoneId);

        MilestoneManager.Milestone memory milestone = milestoneManager.getMilestone(milestoneId);

        assertEq(uint256(milestone.status), uint256(MilestoneManager.MilestoneStatus.Completed));

        assertTrue(milestone.memberAAttested);

        assertTrue(milestone.memberBAttested);

        assertGt(milestone.completedAt, 0);
    }

    function test_CompletedMilestoneAddsTenReputation() public {
        uint256 milestoneId = _proposeMilestone();

        _activateMilestone(milestoneId);

        _completeMilestone(milestoneId);

        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        assertEq(pair.reputation, 10);
    }

    function test_TwoCompletedMilestonesGiveTwentyReputation() public {
        /*
         * Milestone #1
         */
        uint256 first = _proposeMilestone();

        _activateMilestone(first);

        _completeMilestone(first);

        /*
         * Milestone #2
         */
        vm.prank(outsider);

        uint256 second = milestoneManager.proposeMilestone(pairId, "Complete seven-day check-in");

        _activateMilestone(second);

        _completeMilestone(second);

        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        assertEq(pair.reputation, 20);
    }

    function test_CannotCompleteSameMilestoneTwice() public {
        uint256 milestoneId = _proposeMilestone();

        _activateMilestone(milestoneId);

        _completeMilestone(milestoneId);

        PairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        vm.prank(pair.memberA);

        vm.expectRevert(MilestoneManager.MilestoneNotActive.selector);

        milestoneManager.attestCompletion(milestoneId);

        PairRegistry.Pair memory pairAfter = pairRegistry.getPair(pairId);

        /*
         * Still exactly 10.
         */
        assertEq(pairAfter.reputation, 10);
    }

    function test_RandomWalletCannotIncreaseReputation() public {
        vm.prank(outsider);

        vm.expectRevert(PairRegistry.Unauthorized.selector);

        pairRegistry.increaseReputation(pairId);
    }
}
