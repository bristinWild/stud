// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IPairRegistry {
    struct Pair {
        uint256 id;
        address memberA;
        address memberB;
        uint256 reputation;
        uint64 createdAt;
        bool active;
    }

    function getPair(uint256 pairId) external view returns (Pair memory);

    function increaseReputation(uint256 pairId) external;
}

contract MilestoneManager {
    error InvalidPairRegistry();
    error PairNotFound();
    error PairNotActive();
    error InvalidMilestone();
    error EmptyTitle();

    error NotPairMember();
    error MilestoneNotProposed();
    error MilestoneNotActive();

    error AlreadyAccepted();
    error AlreadyAttested();

    enum MilestoneStatus {
        Proposed,
        Active,
        Completed
    }

    struct Milestone {
        uint256 id;
        uint256 pairId;

        address proposer;

        string title;

        MilestoneStatus status;

        bool memberAAccepted;
        bool memberBAccepted;

        bool memberAAttested;
        bool memberBAttested;

        uint64 proposedAt;
        uint64 activatedAt;
        uint64 completedAt;
    }

    IPairRegistry public immutable pairRegistry;

    uint256 public nextMilestoneId = 1;

    mapping(uint256 => Milestone) private milestones;

    event MilestoneProposed(
        uint256 indexed milestoneId, uint256 indexed pairId, address indexed proposer, string title
    );

    event MilestoneAccepted(uint256 indexed milestoneId, address indexed member);

    event MilestoneActivated(uint256 indexed milestoneId, uint256 indexed pairId);

    event CompletionAttested(uint256 indexed milestoneId, address indexed member);

    event MilestoneCompleted(uint256 indexed milestoneId, uint256 indexed pairId);

    constructor(address _pairRegistry) {
        if (_pairRegistry == address(0)) {
            revert InvalidPairRegistry();
        }

        pairRegistry = IPairRegistry(_pairRegistry);
    }

    /**
     * @notice Anyone can propose a milestone.
     *
     * Community members, investors, sponsors,
     * or Pair members themselves may propose.
     *
     * Proposal does NOT give reputation.
     */
    function proposeMilestone(uint256 pairId, string calldata title) external returns (uint256 milestoneId) {
        if (bytes(title).length == 0) {
            revert EmptyTitle();
        }

        IPairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        if (pair.id == 0) {
            revert PairNotFound();
        }

        if (!pair.active) {
            revert PairNotActive();
        }

        milestoneId = nextMilestoneId++;

        milestones[milestoneId] = Milestone({
            id: milestoneId,
            pairId: pairId,
            proposer: msg.sender,
            title: title,
            status: MilestoneStatus.Proposed,
            memberAAccepted: false,
            memberBAccepted: false,
            memberAAttested: false,
            memberBAttested: false,
            proposedAt: uint64(block.timestamp),
            activatedAt: 0,
            completedAt: 0
        });

        emit MilestoneProposed(milestoneId, pairId, msg.sender, title);
    }

    /**
     * @notice Both Pair members must explicitly
     * accept the milestone.
     */
    function acceptMilestone(uint256 milestoneId) external {
        Milestone storage milestone = milestones[milestoneId];

        if (milestone.id == 0) {
            revert InvalidMilestone();
        }

        if (milestone.status != MilestoneStatus.Proposed) {
            revert MilestoneNotProposed();
        }

        IPairRegistry.Pair memory pair = pairRegistry.getPair(milestone.pairId);

        if (msg.sender == pair.memberA) {
            if (milestone.memberAAccepted) {
                revert AlreadyAccepted();
            }

            milestone.memberAAccepted = true;
        } else if (msg.sender == pair.memberB) {
            if (milestone.memberBAccepted) {
                revert AlreadyAccepted();
            }

            milestone.memberBAccepted = true;
        } else {
            revert NotPairMember();
        }

        emit MilestoneAccepted(milestoneId, msg.sender);

        /*
         * Milestone only activates once
         * BOTH Pair members accept.
         */
        if (milestone.memberAAccepted && milestone.memberBAccepted) {
            milestone.status = MilestoneStatus.Active;

            milestone.activatedAt = uint64(block.timestamp);

            emit MilestoneActivated(milestoneId, milestone.pairId);
        }
    }

    /**
     * @notice Both Pair members attest that
     * the accepted milestone was completed.
     *
     * The second attestation completes the
     * milestone and awards +10 reputation.
     */
    function attestCompletion(uint256 milestoneId) external {
        Milestone storage milestone = milestones[milestoneId];

        if (milestone.id == 0) {
            revert InvalidMilestone();
        }

        if (milestone.status != MilestoneStatus.Active) {
            revert MilestoneNotActive();
        }

        IPairRegistry.Pair memory pair = pairRegistry.getPair(milestone.pairId);

        if (msg.sender == pair.memberA) {
            if (milestone.memberAAttested) {
                revert AlreadyAttested();
            }

            milestone.memberAAttested = true;
        } else if (msg.sender == pair.memberB) {
            if (milestone.memberBAttested) {
                revert AlreadyAttested();
            }

            milestone.memberBAttested = true;
        } else {
            revert NotPairMember();
        }

        emit CompletionAttested(milestoneId, msg.sender);

        /*
         * Second attestation completes
         * milestone exactly once.
         */
        if (milestone.memberAAttested && milestone.memberBAttested) {
            /*
             * Set status BEFORE calling
             * PairRegistry.
             */
            milestone.status = MilestoneStatus.Completed;

            milestone.completedAt = uint64(block.timestamp);

            /*
             * PairRegistry itself enforces
             * the fixed +10 reputation rule.
             */
            pairRegistry.increaseReputation(milestone.pairId);

            emit MilestoneCompleted(milestoneId, milestone.pairId);
        }
    }

    function getMilestone(uint256 milestoneId) external view returns (Milestone memory) {
        return milestones[milestoneId];
    }

    function isPairMember(uint256 pairId, address wallet) external view returns (bool) {
        IPairRegistry.Pair memory pair = pairRegistry.getPair(pairId);

        return (wallet == pair.memberA || wallet == pair.memberB);
    }
}
