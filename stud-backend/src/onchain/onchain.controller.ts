import {
    Body,
    Controller,
    Get,
    Param,
    Post,
} from '@nestjs/common';

import {
    getAddress,
    type Address,
} from 'viem';

import { OnchainService } from './onchain.service.js';

@Controller('onchain')
export class OnchainController {
    constructor(
        private readonly onchain:
            OnchainService,
    ) { }

    @Get('stud/:wallet')
    async getStud(
        @Param('wallet')
        wallet: string,
    ) {
        const address =
            getAddress(
                wallet,
            ) as Address;

        const [
            verified,
            studId,
        ] = await Promise.all([
            this.onchain
                .isVerifiedStud(
                    address,
                ),

            this.onchain
                .getStudId(
                    address,
                ),
        ]);

        return {
            wallet: address,
            verified,
            studId:
                studId.toString(),
        };
    }

    @Get('pair/:pairId')
    async getPair(
        @Param('pairId')
        pairId: string,
    ) {
        const id =
            BigInt(pairId);

        const pair =
            await this.onchain.getPair(
                id,
            );

        const marketAddress =
            await this.onchain
                .getPairMarket(
                    id,
                );

        let market = null;

        if (
            marketAddress !==
            '0x0000000000000000000000000000000000000000'
        ) {
            const details =
                await this.onchain
                    .getPairMarketDetails(
                        marketAddress,
                    );

            market = {
                address:
                    details.address,

                pairToken:
                    details.pairToken,

                quoteToken:
                    details.quoteToken,

                reserve:
                    details.reserve.toString(),

                currentPrice:
                    details.currentPrice.toString(),

                totalSupply:
                    details.totalSupply.toString(),

                marketCapacity:
                    details.marketCapacity.toString(),

                graduationEligible:
                    details.graduationEligible,

                basePrice:
                    details.basePrice.toString(),

                slope:
                    details.slope.toString(),
            };
        }

        return {
            id:
                pair.id.toString(),

            memberA:
                pair.memberA,

            memberB:
                pair.memberB,

            reputation:
                pair.reputation.toString(),

            createdAt:
                pair.createdAt.toString(),

            active:
                pair.active,

            market,
        };
    }

    @Get('prediction-market/:marketId')
    async getPredictionMarket(
        @Param('marketId')
        marketId: string,
    ) {
        const address =
            await this.onchain
                .getPredictionMarket(
                    BigInt(marketId),
                );

        const market =
            await this.onchain
                .getPredictionMarketDetails(
                    address,
                );

        const outcomeNames = [
            'unresolved',
            'yes',
            'no',
        ];

        return {
            marketId,
            address:
                market.address,

            subject:
                market.subject,

            studId:
                market.studId.toString(),

            question:
                market.question,

            closesAt:
                market.closesAt.toString(),

            resolver:
                market.resolver,

            quoteToken:
                market.quoteToken,

            outcome: {
                value:
                    Number(market.outcome),

                label:
                    outcomeNames[
                    Number(
                        market.outcome,
                    )
                    ],
            },

            pools: {
                yes:
                    market.yesPool.toString(),

                no:
                    market.noPool.toString(),

                total:
                    market.totalPool.toString(),
            },

            probabilities: {
                yesBps:
                    market
                        .yesProbabilityBps
                        .toString(),

                noBps:
                    market
                        .noProbabilityBps
                        .toString(),

                yesPercent:
                    Number(
                        market.yesProbabilityBps,
                    ) / 100,

                noPercent:
                    Number(
                        market.noProbabilityBps,
                    ) / 100,
            },
        };
    }

    @Get('stud/:studId/prediction-markets')
    async getPredictionMarketsForStud(
        @Param('studId')
        studId: string,
    ) {
        const addresses =
            await this.onchain
                .getPredictionMarketsForStud(
                    BigInt(studId),
                );

        const markets =
            await Promise.all(
                addresses.map(
                    async (address) => {
                        const market =
                            await this.onchain
                                .getPredictionMarketDetails(
                                    address,
                                );

                        const outcomeNames = [
                            'unresolved',
                            'yes',
                            'no',
                        ];

                        return {
                            address:
                                market.address,

                            subject:
                                market.subject,

                            studId:
                                market.studId.toString(),

                            question:
                                market.question,

                            closesAt:
                                market.closesAt.toString(),

                            resolver:
                                market.resolver,

                            quoteToken:
                                market.quoteToken,

                            outcome: {
                                value:
                                    Number(
                                        market.outcome,
                                    ),

                                label:
                                    outcomeNames[
                                    Number(
                                        market.outcome,
                                    )
                                    ],
                            },

                            pools: {
                                yes:
                                    market.yesPool
                                        .toString(),

                                no:
                                    market.noPool
                                        .toString(),

                                total:
                                    market.totalPool
                                        .toString(),
                            },

                            probabilities: {
                                yesBps:
                                    market
                                        .yesProbabilityBps
                                        .toString(),

                                noBps:
                                    market
                                        .noProbabilityBps
                                        .toString(),

                                yesPercent:
                                    Number(
                                        market
                                            .yesProbabilityBps,
                                    ) / 100,

                                noPercent:
                                    Number(
                                        market
                                            .noProbabilityBps,
                                    ) / 100,
                            },
                        };
                    },
                ),
            );

        return {
            studId,
            markets,
        };
    }

    @Post('prediction-market')
    async createPredictionMarket(
        @Body()
        body: {
            subject: string;
            question: string;
            closesAt: string;
        },
    ) {
        const subject =
            getAddress(
                body.subject,
            ) as Address;

        const result =
            await this.onchain
                .createPredictionMarket(
                    subject,
                    body.question,
                    BigInt(
                        body.closesAt,
                    ),
                );

        return {
            transactionHash:
                result.hash,

            blockNumber:
                result.blockNumber
                    .toString(),

            status:
                result.status,

            marketId:
                result.marketId
                    .toString(),

            marketAddress:
                result.marketAddress,
        };
    }

    @Post(
        'prediction-market/:marketId/resolve',
    )
    async resolvePredictionMarket(
        @Param('marketId')
        marketId: string,

        @Body()
        body: {
            outcome: 'yes' | 'no';
        },
    ) {
        if (
            body.outcome !== 'yes'
            && body.outcome !== 'no'
        ) {
            throw new Error(
                'Outcome must be yes or no',
            );
        }

        const outcome =
            body.outcome === 'yes'
                ? 1
                : 2;

        const result =
            await this.onchain
                .resolvePredictionMarket(
                    BigInt(marketId),
                    outcome,
                );

        return {
            transactionHash:
                result.hash,

            blockNumber:
                result.blockNumber
                    .toString(),

            status:
                result.status,

            marketId,

            marketAddress:
                result.marketAddress,

            outcome:
                body.outcome,
        };
    }
}