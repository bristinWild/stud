// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {StudPredictionMarket} from "./StudPredictionMarket.sol";

interface IStudRegistryPredictionFactory {
    function isVerifiedStud(address wallet) external view returns (bool);

    function getStudId(address wallet) external view returns (uint256);
}

contract StudPredictionMarketFactory {
    error InvalidStudRegistry();
    error InvalidQuoteToken();
    error InvalidCreator();
    error InvalidResolver();

    error UnauthorizedCreator();

    error InvalidSubject();
    error SubjectNotVerifiedStud();

    error EmptyQuestion();
    error InvalidCloseTime();

    IStudRegistryPredictionFactory public immutable studRegistry;

    address public immutable quoteToken;

    /*
     * Trusted protocol/backend wallet
     * allowed to create approved markets.
     */
    address public immutable marketCreator;

    /*
     * Trusted resolver used by markets
     * created through this factory.
     */
    address public immutable resolver;

    uint256 public nextMarketId = 1;

    mapping(uint256 => address) public marketForId;

    mapping(address => uint256) public idForMarket;

    mapping(uint256 => address[]) private marketsByStudId;

    event PredictionMarketCreated(
        uint256 indexed marketId,
        uint256 indexed studId,
        address indexed subject,
        address market,
        string question,
        uint64 closesAt,
        address resolver
    );

    constructor(address studRegistry_, address quoteToken_, address marketCreator_, address resolver_) {
        if (studRegistry_ == address(0)) {
            revert InvalidStudRegistry();
        }

        if (quoteToken_ == address(0)) {
            revert InvalidQuoteToken();
        }

        if (marketCreator_ == address(0)) {
            revert InvalidCreator();
        }

        if (resolver_ == address(0)) {
            revert InvalidResolver();
        }

        studRegistry = IStudRegistryPredictionFactory(studRegistry_);

        quoteToken = quoteToken_;

        marketCreator = marketCreator_;

        resolver = resolver_;
    }

    function createMarket(address subject, string calldata question, uint64 closesAt)
        external
        returns (address marketAddress)
    {
        if (msg.sender != marketCreator) {
            revert UnauthorizedCreator();
        }

        if (subject == address(0)) {
            revert InvalidSubject();
        }

        if (bytes(question).length == 0) {
            revert EmptyQuestion();
        }

        if (closesAt <= block.timestamp) {
            revert InvalidCloseTime();
        }

        if (!studRegistry.isVerifiedStud(subject)) {
            revert SubjectNotVerifiedStud();
        }

        uint256 studId = studRegistry.getStudId(subject);

        uint256 marketId = nextMarketId;

        nextMarketId++;

        StudPredictionMarket market =
            new StudPredictionMarket(address(studRegistry), quoteToken, subject, question, closesAt, resolver);

        marketAddress = address(market);

        marketForId[marketId] = marketAddress;

        idForMarket[marketAddress] = marketId;

        marketsByStudId[studId].push(marketAddress);

        emit PredictionMarketCreated(marketId, studId, subject, marketAddress, question, closesAt, resolver);
    }

    function getMarketsByStudId(uint256 studId) external view returns (address[] memory) {
        return marketsByStudId[studId];
    }

    function marketCount() external view returns (uint256) {
        return nextMarketId - 1;
    }
}
