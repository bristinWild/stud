// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";

contract StudRegistry is EIP712 {
    using ECDSA for bytes32;

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Wallet is already registered as a Stud.
    error AlreadyRegistered();

    /// @notice This World ID nullifier has already been used.
    error NullifierAlreadyUsed();

    /// @notice EIP-712 authorization was not signed by verifierSigner.
    error InvalidAuthorization();

    /// @notice Backend authorization has expired.
    error AuthorizationExpired();

    /// @notice Zero-value nullifier is not allowed.
    error InvalidNullifier();

    /// @notice Verifier signer cannot be the zero address.
    error InvalidVerifierSigner();

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Stud {
        uint256 id;
        address wallet;
        bool verified;
        uint64 registeredAt;
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * Backend signs:
     *
     * RegisterStud(
     *   wallet,
     *   nullifierHash,
     *   deadline
     * )
     *
     * This must exactly match the EIP-712 structure used
     * by the NestJS authorization signer.
     */
    bytes32 private constant REGISTER_STUD_TYPEHASH =
        keccak256("RegisterStud(address wallet,bytes32 nullifierHash,uint256 deadline)");

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Trusted signer controlled by the Stud backend.
     *
     * NestJS only signs an authorization after World ID
     * verification succeeds.
     */
    address public immutable verifierSigner;

    /**
     * @notice ID assigned to the next registered Stud.
     *
     * Stud IDs begin at 1.
     * ID 0 therefore represents "not registered".
     */
    uint256 public nextStudId = 1;

    /**
     * wallet => Stud
     */
    mapping(address => Stud) private studs;

    /**
     * World ID nullifier => consumed?
     *
     * Prevents a verified World identity from registering
     * more than once.
     */
    mapping(bytes32 => bool) private usedNullifiers;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event StudRegistered(
        uint256 indexed studId, address indexed wallet, bytes32 indexed nullifierHash, uint64 registeredAt
    );

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @param _verifierSigner Address corresponding to the private
     * key used by NestJS to sign registration authorizations.
     */
    constructor(address _verifierSigner) EIP712("StudRegistry", "1") {
        if (_verifierSigner == address(0)) {
            revert InvalidVerifierSigner();
        }

        verifierSigner = _verifierSigner;
    }

    /*//////////////////////////////////////////////////////////////
                            REGISTRATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Register msg.sender as a verified Stud.
     *
     * Flow:
     *
     * World ID
     *     ↓
     * NestJS verifies proof
     *     ↓
     * NestJS signs EIP-712 authorization
     *     ↓
     * User calls registerStud()
     *
     * @param nullifierHash World ID nullifier returned after
     * successful verification.
     *
     * @param deadline Timestamp after which the backend
     * authorization becomes invalid.
     *
     * @param signature EIP-712 signature produced by verifierSigner.
     *
     * @return studId Newly-created Stud ID.
     */
    function registerStud(bytes32 nullifierHash, uint256 deadline, bytes calldata signature)
        external
        returns (uint256 studId)
    {
        /*//////////////////////////////////////////////////////////
                            WALLET CHECK
        //////////////////////////////////////////////////////////*/

        if (studs[msg.sender].verified) {
            revert AlreadyRegistered();
        }

        /*//////////////////////////////////////////////////////////
                           NULLIFIER CHECKS
        //////////////////////////////////////////////////////////*/

        if (nullifierHash == bytes32(0)) {
            revert InvalidNullifier();
        }

        if (usedNullifiers[nullifierHash]) {
            revert NullifierAlreadyUsed();
        }

        /*//////////////////////////////////////////////////////////
                         AUTHORIZATION EXPIRY
        //////////////////////////////////////////////////////////*/

        if (block.timestamp > deadline) {
            revert AuthorizationExpired();
        }

        /*//////////////////////////////////////////////////////////
                        VERIFY EIP-712 SIGNATURE
        //////////////////////////////////////////////////////////*/

        bytes32 digest = registrationDigest(msg.sender, nullifierHash, deadline);

        address recoveredSigner = digest.recover(signature);

        if (recoveredSigner != verifierSigner) {
            revert InvalidAuthorization();
        }

        /*//////////////////////////////////////////////////////////
                          CONSUME NULLIFIER
        //////////////////////////////////////////////////////////*/

        usedNullifiers[nullifierHash] = true;

        /*//////////////////////////////////////////////////////////
                           CREATE STUD
        //////////////////////////////////////////////////////////*/

        studId = nextStudId++;

        uint64 registeredAt = uint64(block.timestamp);

        studs[msg.sender] = Stud({id: studId, wallet: msg.sender, verified: true, registeredAt: registeredAt});

        /*//////////////////////////////////////////////////////////
                              EVENT
        //////////////////////////////////////////////////////////*/

        emit StudRegistered(studId, msg.sender, nullifierHash, registeredAt);
    }

    /*//////////////////////////////////////////////////////////////
                           EIP-712 HELPERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the exact EIP-712 digest NestJS must sign.
     */
    function registrationDigest(address wallet, bytes32 nullifierHash, uint256 deadline) public view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(REGISTER_STUD_TYPEHASH, wallet, nullifierHash, deadline));

        return _hashTypedDataV4(structHash);
    }

    /*//////////////////////////////////////////////////////////////
                                VIEWS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Check whether a wallet is a verified Stud.
     *
     * PairRegistry will use this.
     */
    function isVerifiedStud(address wallet) external view returns (bool) {
        return studs[wallet].verified;
    }

    /**
     * @notice Return complete Stud information for a wallet.
     */
    function getStud(address wallet) external view returns (Stud memory) {
        return studs[wallet];
    }

    /**
     * @notice Return the Stud ID belonging to a wallet.
     *
     * Returns 0 for an unregistered wallet.
     */
    function getStudId(address wallet) external view returns (uint256) {
        return studs[wallet].id;
    }

    /**
     * @notice Check whether a World ID nullifier has already
     * been consumed onchain.
     */
    function isNullifierUsed(bytes32 nullifierHash) external view returns (bool) {
        return usedNullifiers[nullifierHash];
    }
}
