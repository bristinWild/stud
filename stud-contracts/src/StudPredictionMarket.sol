// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IStudRegistryPrediction {
    function isVerifiedStud(address wallet) external view returns (bool);

    function getStudId(address wallet) external view returns (uint256);
}

contract StudPredictionMarket is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Outcome {
        Unresolved,
        Yes,
        No
    }

    error InvalidStudRegistry();
    error InvalidQuoteToken();
    error InvalidSubject();
    error SubjectNotVerifiedStud();

    error EmptyQuestion();

    error InvalidCloseTime();
    error MarketClosed();
    error MarketStillOpen();

    error InvalidAmount();

    error UnauthorizedResolver();
    error AlreadyResolved();
    error InvalidOutcome();

    error NothingToClaim();
    error AlreadyClaimed();
    error MarketNotResolved();

    IStudRegistryPrediction public immutable studRegistry;

    IERC20 public immutable quoteToken;

    address public immutable subject;

    uint256 public immutable studId;

    address public immutable resolver;

    string public question;

    uint64 public immutable closesAt;

    Outcome public outcome;

    uint256 public yesPool;

    uint256 public noPool;

    mapping(address => uint256) public yesPositions;

    mapping(address => uint256) public noPositions;

    mapping(address => bool) public claimed;

    event PositionTaken(address indexed user, bool indexed isYes, uint256 amount);

    event MarketResolved(Outcome outcome);

    event WinningsClaimed(address indexed user, uint256 amount);

    constructor(
        address studRegistry_,
        address quoteToken_,
        address subject_,
        string memory question_,
        uint64 closesAt_,
        address resolver_
    ) {
        if (studRegistry_ == address(0)) {
            revert InvalidStudRegistry();
        }

        if (quoteToken_ == address(0)) {
            revert InvalidQuoteToken();
        }

        if (subject_ == address(0)) {
            revert InvalidSubject();
        }

        if (resolver_ == address(0)) {
            revert UnauthorizedResolver();
        }

        if (bytes(question_).length == 0) {
            revert EmptyQuestion();
        }

        if (closesAt_ <= block.timestamp) {
            revert InvalidCloseTime();
        }

        studRegistry = IStudRegistryPrediction(studRegistry_);

        if (!studRegistry.isVerifiedStud(subject_)) {
            revert SubjectNotVerifiedStud();
        }

        quoteToken = IERC20(quoteToken_);

        subject = subject_;

        studId = studRegistry.getStudId(subject_);

        question = question_;

        closesAt = closesAt_;

        resolver = resolver_;

        outcome = Outcome.Unresolved;
    }

    function takeYes(uint256 amount) external nonReentrant {
        _takePosition(true, amount);
    }

    function takeNo(uint256 amount) external nonReentrant {
        _takePosition(false, amount);
    }

    function _takePosition(bool isYes, uint256 amount) internal {
        if (block.timestamp >= closesAt) {
            revert MarketClosed();
        }

        if (amount == 0) {
            revert InvalidAmount();
        }

        quoteToken.safeTransferFrom(msg.sender, address(this), amount);

        if (isYes) {
            yesPositions[msg.sender] += amount;

            yesPool += amount;
        } else {
            noPositions[msg.sender] += amount;

            noPool += amount;
        }

        emit PositionTaken(msg.sender, isYes, amount);
    }

    function resolve(Outcome finalOutcome) external {
        if (msg.sender != resolver) {
            revert UnauthorizedResolver();
        }

        if (block.timestamp < closesAt) {
            revert MarketStillOpen();
        }

        if (outcome != Outcome.Unresolved) {
            revert AlreadyResolved();
        }

        if (finalOutcome == Outcome.Unresolved) {
            revert InvalidOutcome();
        }

        outcome = finalOutcome;

        emit MarketResolved(finalOutcome);
    }

    function claim() external nonReentrant {
        if (outcome == Outcome.Unresolved) {
            revert MarketNotResolved();
        }

        if (claimed[msg.sender]) {
            revert AlreadyClaimed();
        }

        uint256 winningStake;
        uint256 winningPool;

        if (outcome == Outcome.Yes) {
            winningStake = yesPositions[msg.sender];

            winningPool = yesPool;
        } else {
            winningStake = noPositions[msg.sender];

            winningPool = noPool;
        }

        uint256 payout;

        /*
         * Edge case:
         *
         * If nobody backed the actual
         * winning outcome, refund users
         * instead of locking the pool.
         */
        if (winningPool == 0) {
            payout = yesPositions[msg.sender] + noPositions[msg.sender];

            if (payout == 0) {
                revert NothingToClaim();
            }
        } else {
            if (winningStake == 0) {
                revert NothingToClaim();
            }

            uint256 poolTotal = yesPool + noPool;

            payout = (winningStake * poolTotal) / winningPool;
        }

        claimed[msg.sender] = true;

        quoteToken.safeTransfer(msg.sender, payout);

        emit WinningsClaimed(msg.sender, payout);
    }

    function yesProbabilityBps() external view returns (uint256) {
        uint256 total = yesPool + noPool;

        if (total == 0) {
            return 5_000;
        }

        return (yesPool * 10_000) / total;
    }

    function noProbabilityBps() external view returns (uint256) {
        uint256 total = yesPool + noPool;

        if (total == 0) {
            return 5_000;
        }

        return (noPool * 10_000) / total;
    }

    function totalPool() external view returns (uint256) {
        return yesPool + noPool;
    }
}
