// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";

interface IStudRegistry {
    function isVerifiedStud(address wallet) external view returns (bool);
}

contract PairRegistry is EIP712 {
    using ECDSA for bytes32;

    error InvalidStudRegistry();
    error InvalidPairSigner();
    error InvalidMilestoneManager();

    error InvalidAuthorization();
    error AuthorizationExpired();

    error SameMember();
    error UnverifiedStud();
    error PairAlreadyExists();
    error PairNotFound();
    error PairNotActive();

    error Unauthorized();
    error MilestoneManagerAlreadySet();

    struct Pair {
        uint256 id;
        address memberA;
        address memberB;
        uint256 reputation;
        uint64 createdAt;
        bool active;
    }

    bytes32 private constant CREATE_PAIR_TYPEHASH =
        keccak256("CreatePair(address memberA,address memberB,uint256 deadline)");

    /**
     * Every successfully completed and mutually-attested
     * milestone grants exactly 10 reputation.
     */
    uint256 public constant REPUTATION_PER_MILESTONE = 10;

    IStudRegistry public immutable studRegistry;

    /**
     * Backend signer responsible for authorizing
     * Pair creation after a mutual match.
     */
    address public immutable pairSigner;

    /**
     * Address that deployed PairRegistry.
     *
     * Used only to configure MilestoneManager once.
     */
    address public immutable admin;

    /**
     * MilestoneManager is configured after deployment.
     */
    address public milestoneManager;

    uint256 public nextPairId = 1;

    mapping(uint256 => Pair) private pairs;

    /**
     * Canonical member pair hash => Pair ID.
     */
    mapping(bytes32 => uint256) private pairIds;

    event PairCreated(uint256 indexed pairId, address indexed memberA, address indexed memberB, uint64 createdAt);

    event MilestoneManagerConfigured(address indexed milestoneManager);

    event ReputationIncreased(uint256 indexed pairId, uint256 oldReputation, uint256 newReputation);

    constructor(address _studRegistry, address _pairSigner) EIP712("PairRegistry", "1") {
        if (_studRegistry == address(0)) {
            revert InvalidStudRegistry();
        }

        if (_pairSigner == address(0)) {
            revert InvalidPairSigner();
        }

        studRegistry = IStudRegistry(_studRegistry);

        pairSigner = _pairSigner;

        admin = msg.sender;
    }

    /**
     * @notice Configure MilestoneManager exactly once.
     *
     * PairRegistry is deployed first.
     * MilestoneManager is then deployed with PairRegistry's address.
     * Finally this function connects the two contracts.
     */
    function setMilestoneManager(address _milestoneManager) external {
        if (msg.sender != admin) {
            revert Unauthorized();
        }

        if (_milestoneManager == address(0)) {
            revert InvalidMilestoneManager();
        }

        if (milestoneManager != address(0)) {
            revert MilestoneManagerAlreadySet();
        }

        milestoneManager = _milestoneManager;

        emit MilestoneManagerConfigured(_milestoneManager);
    }

    function createPair(address otherMember, uint256 deadline, bytes calldata signature)
        external
        returns (uint256 pairId)
    {
        if (msg.sender == otherMember) {
            revert SameMember();
        }

        if (!studRegistry.isVerifiedStud(msg.sender) || !studRegistry.isVerifiedStud(otherMember)) {
            revert UnverifiedStud();
        }

        if (block.timestamp > deadline) {
            revert AuthorizationExpired();
        }

        (address memberA, address memberB) = _sortMembers(msg.sender, otherMember);

        bytes32 key = pairKey(memberA, memberB);

        if (pairIds[key] != 0) {
            revert PairAlreadyExists();
        }

        bytes32 digest = creationDigest(memberA, memberB, deadline);

        address recoveredSigner = digest.recover(signature);

        if (recoveredSigner != pairSigner) {
            revert InvalidAuthorization();
        }

        pairId = nextPairId++;

        uint64 createdAt = uint64(block.timestamp);

        pairs[pairId] =
            Pair({id: pairId, memberA: memberA, memberB: memberB, reputation: 0, createdAt: createdAt, active: true});

        pairIds[key] = pairId;

        emit PairCreated(pairId, memberA, memberB, createdAt);
    }

    /**
     * @notice Increase Pair reputation after successful
     * milestone completion.
     *
     * ONLY MilestoneManager may call this.
     *
     * The amount is deliberately fixed to +10.
     */
    function increaseReputation(uint256 pairId) external {
        if (msg.sender != milestoneManager) {
            revert Unauthorized();
        }

        Pair storage pair = pairs[pairId];

        if (pair.id == 0) {
            revert PairNotFound();
        }

        if (!pair.active) {
            revert PairNotActive();
        }

        uint256 oldReputation = pair.reputation;

        pair.reputation = oldReputation + REPUTATION_PER_MILESTONE;

        emit ReputationIncreased(pairId, oldReputation, pair.reputation);
    }

    function creationDigest(address memberA, address memberB, uint256 deadline) public view returns (bytes32) {
        (address first, address second) = _sortMembers(memberA, memberB);

        bytes32 structHash = keccak256(abi.encode(CREATE_PAIR_TYPEHASH, first, second, deadline));

        return _hashTypedDataV4(structHash);
    }

    function getPair(uint256 pairId) external view returns (Pair memory) {
        return pairs[pairId];
    }

    function getPairId(address memberA, address memberB) external view returns (uint256) {
        return pairIds[pairKey(memberA, memberB)];
    }

    function pairKey(address memberA, address memberB) public pure returns (bytes32) {
        (address first, address second) = _sortMembers(memberA, memberB);

        return keccak256(abi.encode(first, second));
    }

    function _sortMembers(address memberA, address memberB) internal pure returns (address first, address second) {
        if (memberA < memberB) {
            return (memberA, memberB);
        }

        return (memberB, memberA);
    }
}
