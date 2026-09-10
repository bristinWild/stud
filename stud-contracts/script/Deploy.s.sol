// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";

import {StudRegistry} from "../src/StudRegistry.sol";
import {PairRegistry} from "../src/PairRegistry.sol";
import {MilestoneManager} from "../src/MilestoneManager.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {PairMarketFactory} from "../src/PairMarketFactory.sol";
import {StudPredictionMarketFactory} from "../src/StudPredictionMarketFactory.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        address verifierSigner = vm.envAddress("VERIFIER_SIGNER");

        address pairSigner = vm.envAddress("PAIR_SIGNER");

        address marketCreator = vm.envAddress("MARKET_CREATOR");

        address marketResolver = vm.envAddress("MARKET_RESOLVER");

        vm.startBroadcast(deployerPrivateKey);

        StudRegistry studRegistry = new StudRegistry(verifierSigner);

        PairRegistry pairRegistry = new PairRegistry(address(studRegistry), pairSigner);

        MilestoneManager milestoneManager = new MilestoneManager(address(pairRegistry));

        pairRegistry.setMilestoneManager(address(milestoneManager));

        /*
         * Local/testing only.
         *
         * Replace MockUSDC with the
         * real USDC address for
         * public deployment.
         */
        MockUSDC mockUsdc = new MockUSDC();

        PairMarketFactory pairMarketFactory = new PairMarketFactory(address(pairRegistry), address(mockUsdc));

        StudPredictionMarketFactory predictionMarketFactory =
            new StudPredictionMarketFactory(address(studRegistry), address(mockUsdc), marketCreator, marketResolver);

        vm.stopBroadcast();

        console2.log("StudRegistry:", address(studRegistry));

        console2.log("PairRegistry:", address(pairRegistry));

        console2.log("MilestoneManager:", address(milestoneManager));

        console2.log("MockUSDC:", address(mockUsdc));

        console2.log("PairMarketFactory:", address(pairMarketFactory));

        console2.log("StudPredictionMarketFactory:", address(predictionMarketFactory));

        console2.log("MarketCreator:", marketCreator);

        console2.log("MarketResolver:", marketResolver);
    }
}
