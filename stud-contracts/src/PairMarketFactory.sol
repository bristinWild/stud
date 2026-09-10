// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import {PairMarket, IPairRegistryMarket} from "./PairMarket.sol";

contract PairMarketFactory is EIP712 {
    error InvalidPairRegistry();
    error InvalidQuoteToken();

    error PairNotFound();
    error PairNotActive();

    error NotPairMember();

    error MarketAlreadyExists();

    error EmptyTokenName();
    error EmptyTokenSymbol();

    error AuthorizationExpired();
    error InvalidCounterpartySignature();

    IPairRegistryMarket public immutable pairRegistry;

    address public immutable quoteToken;

    mapping(uint256 => address) public marketForPair;

    bytes32 public constant ACTIVATE_MARKET_TYPEHASH =
        keccak256("ActivateMarket(uint256 pairId,string tokenName,string tokenSymbol,uint256 deadline)");

    event PairMarketCreated(
        uint256 indexed pairId,
        address indexed market,
        address indexed pairToken,
        address activatedBy,
        string tokenName,
        string tokenSymbol
    );

    constructor(address pairRegistry_, address quoteToken_) EIP712("StudPairMarketFactory", "1") {
        if (pairRegistry_ == address(0)) {
            revert InvalidPairRegistry();
        }

        if (quoteToken_ == address(0)) {
            revert InvalidQuoteToken();
        }

        pairRegistry = IPairRegistryMarket(pairRegistry_);

        quoteToken = quoteToken_;
    }

    function createMarket(
        uint256 pairId,
        string calldata tokenName,
        string calldata tokenSymbol,
        uint256 deadline,
        bytes calldata counterpartySignature
    ) external returns (address marketAddress) {
        _validateMetadata(tokenName, tokenSymbol);

        if (marketForPair[pairId] != address(0)) {
            revert MarketAlreadyExists();
        }

        address counterparty = _getCounterparty(pairId, msg.sender);

        _validateAuthorization(counterparty, pairId, tokenName, tokenSymbol, deadline, counterpartySignature);

        marketAddress = _deployMarket(pairId, tokenName, tokenSymbol, msg.sender);
    }

    function _validateMetadata(string calldata tokenName, string calldata tokenSymbol) internal pure {
        if (bytes(tokenName).length == 0) {
            revert EmptyTokenName();
        }

        if (bytes(tokenSymbol).length == 0) {
            revert EmptyTokenSymbol();
        }
    }

    function _getCounterparty(uint256 pairId, address caller) internal view returns (address counterparty) {
        IPairRegistryMarket.Pair memory pair = pairRegistry.getPair(pairId);

        if (pair.id == 0) {
            revert PairNotFound();
        }

        if (!pair.active) {
            revert PairNotActive();
        }

        if (caller == pair.memberA) {
            return pair.memberB;
        }

        if (caller == pair.memberB) {
            return pair.memberA;
        }

        revert NotPairMember();
    }

    function _validateAuthorization(
        address counterparty,
        uint256 pairId,
        string calldata tokenName,
        string calldata tokenSymbol,
        uint256 deadline,
        bytes calldata signature
    ) internal view {
        if (block.timestamp > deadline) {
            revert AuthorizationExpired();
        }

        bytes32 digest = activationDigest(pairId, tokenName, tokenSymbol, deadline);

        if (!SignatureChecker.isValidSignatureNow(counterparty, digest, signature)) {
            revert InvalidCounterpartySignature();
        }
    }

    function _deployMarket(uint256 pairId, string calldata tokenName, string calldata tokenSymbol, address activatedBy)
        internal
        returns (address marketAddress)
    {
        PairMarket market = new PairMarket(address(pairRegistry), quoteToken, pairId, tokenName, tokenSymbol);

        marketAddress = address(market);

        marketForPair[pairId] = marketAddress;

        emit PairMarketCreated(pairId, marketAddress, address(market.pairToken()), activatedBy, tokenName, tokenSymbol);
    }

    function activationDigest(uint256 pairId, string memory tokenName, string memory tokenSymbol, uint256 deadline)
        public
        view
        returns (bytes32)
    {
        bytes32 structHash = keccak256(
            abi.encode(
                ACTIVATE_MARKET_TYPEHASH, pairId, keccak256(bytes(tokenName)), keccak256(bytes(tokenSymbol)), deadline
            )
        );

        return _hashTypedDataV4(structHash);
    }

    function hasMarket(uint256 pairId) external view returns (bool) {
        return marketForPair[pairId] != address(0);
    }
}
