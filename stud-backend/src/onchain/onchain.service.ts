import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    createPublicClient,
    createWalletClient,
    http,
    getAddress,
    type Address,
    type Hex,
} from 'viem';

import {
    privateKeyToAccount,
} from 'viem/accounts';
import { foundry } from 'viem/chains';



const studRegistryAbi = [
    {
        type: 'function',
        name: 'isVerifiedStud',
        stateMutability: 'view',
        inputs: [
            {
                name: 'wallet',
                type: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'bool',
            },
        ],
    },
    {
        type: 'function',
        name: 'getStudId',
        stateMutability: 'view',
        inputs: [
            {
                name: 'wallet',
                type: 'address',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
] as const;

const pairRegistryAbi = [
    {
        type: 'function',
        name: 'getPair',
        stateMutability: 'view',
        inputs: [
            {
                name: 'pairId',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    {
                        name: 'id',
                        type: 'uint256',
                    },
                    {
                        name: 'memberA',
                        type: 'address',
                    },
                    {
                        name: 'memberB',
                        type: 'address',
                    },
                    {
                        name: 'reputation',
                        type: 'uint256',
                    },
                    {
                        name: 'createdAt',
                        type: 'uint64',
                    },
                    {
                        name: 'active',
                        type: 'bool',
                    },
                ],
            },
        ],
    },
] as const;

const pairMarketFactoryAbi = [
    {
        type: 'function',
        name: 'marketForPair',
        stateMutability: 'view',
        inputs: [
            {
                name: 'pairId',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'address',
            },
        ],
    },
] as const;

const predictionFactoryAbi = [
    {
        type: 'function',
        name: 'marketForId',
        stateMutability: 'view',
        inputs: [
            {
                name: 'marketId',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'address',
            },
        ],
    },
    {
        type: 'function',
        name: 'marketCount',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'getMarketsByStudId',
        stateMutability: 'view',
        inputs: [
            {
                name: 'studId',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: '',
                type: 'address[]',
            },
        ],
    },
] as const;

const predictionMarketAbi = [
    {
        type: 'function',
        name: 'subject',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
    },
    {
        type: 'function',
        name: 'studId',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'question',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
    },
    {
        type: 'function',
        name: 'closesAt',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint64' }],
    },
    {
        type: 'function',
        name: 'resolver',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
    },
    {
        type: 'function',
        name: 'quoteToken',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
    },
    {
        type: 'function',
        name: 'outcome',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
    },
    {
        type: 'function',
        name: 'yesPool',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'noPool',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'yesProbabilityBps',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'noProbabilityBps',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'totalPool',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const;


const predictionFactoryWriteAbi = [
    {
        type: 'function',
        name: 'createMarket',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'subject',
                type: 'address',
            },
            {
                name: 'question',
                type: 'string',
            },
            {
                name: 'closesAt',
                type: 'uint64',
            },
        ],
        outputs: [
            {
                name: 'marketAddress',
                type: 'address',
            },
        ],
    },
] as const;

const pairMarketAbi = [
    {
        type: 'function',
        name: 'pairId',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'pairToken',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
    },
    {
        type: 'function',
        name: 'quoteToken',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'address' }],
    },
    {
        type: 'function',
        name: 'reserve',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'currentPrice',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'totalSupply',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'marketCapacity',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'isGraduationEligible',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'bool' }],
    },
    {
        type: 'function',
        name: 'basePrice',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        type: 'function',
        name: 'slope',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const;

const predictionMarketWriteAbi = [
    {
        type: 'function',
        name: 'resolve',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'finalOutcome',
                type: 'uint8',
            },
        ],
        outputs: [],
    },
] as const;

@Injectable()
export class OnchainService {
    private readonly client;
    private readonly walletClient;
    private readonly marketCreatorAccount;

    readonly studRegistryAddress: Address;
    readonly pairRegistryAddress: Address;
    readonly pairMarketFactoryAddress: Address;
    readonly predictionMarketFactoryAddress: Address;

    constructor(
        private readonly configService: ConfigService,
    ) {
        const rpcUrl =
            this.configService.getOrThrow<string>(
                'RPC_URL',
            );

        this.studRegistryAddress =
            getAddress(
                this.configService.getOrThrow<string>(
                    'STUD_REGISTRY_ADDRESS',
                ),
            );

        this.pairRegistryAddress =
            getAddress(
                this.configService.getOrThrow<string>(
                    'PAIR_REGISTRY_ADDRESS',
                ),
            );

        this.pairMarketFactoryAddress =
            getAddress(
                this.configService.getOrThrow<string>(
                    'PAIR_MARKET_FACTORY_ADDRESS',
                ),
            );

        this.predictionMarketFactoryAddress =
            getAddress(
                this.configService.getOrThrow<string>(
                    'STUD_PREDICTION_MARKET_FACTORY_ADDRESS',
                ),
            );

        this.client =
            createPublicClient({
                chain: foundry,
                transport: http(rpcUrl),
            });

        const marketCreatorPrivateKey =
            this.configService.getOrThrow<Hex>(
                'MARKET_CREATOR_PRIVATE_KEY',
            );

        this.marketCreatorAccount =
            privateKeyToAccount(
                marketCreatorPrivateKey,
            );

        this.walletClient =
            createWalletClient({
                account:
                    this.marketCreatorAccount,
                chain: foundry,
                transport: http(rpcUrl),
            });
    }



    async isVerifiedStud(
        wallet: Address,
    ) {
        return this.client.readContract({
            address:
                this.studRegistryAddress,
            abi: studRegistryAbi,
            functionName:
                'isVerifiedStud',
            args: [
                getAddress(wallet),
            ],
        });
    }

    async getStudId(
        wallet: Address,
    ) {
        return this.client.readContract({
            address:
                this.studRegistryAddress,
            abi: studRegistryAbi,
            functionName: 'getStudId',
            args: [
                getAddress(wallet),
            ],
        });
    }

    async getPair(
        pairId: bigint,
    ) {
        return this.client.readContract({
            address:
                this.pairRegistryAddress,
            abi: pairRegistryAbi,
            functionName: 'getPair',
            args: [pairId],
        });
    }

    async getPairMarket(
        pairId: bigint,
    ) {
        return this.client.readContract({
            address:
                this.pairMarketFactoryAddress,
            abi: pairMarketFactoryAbi,
            functionName:
                'marketForPair',
            args: [pairId],
        });
    }

    async getPredictionMarket(
        marketId: bigint,
    ) {
        return this.client.readContract({
            address:
                this.predictionMarketFactoryAddress,
            abi: predictionFactoryAbi,
            functionName: 'marketForId',
            args: [marketId],
        });
    }

    async getPredictionMarketCount() {
        return this.client.readContract({
            address:
                this.predictionMarketFactoryAddress,
            abi: predictionFactoryAbi,
            functionName: 'marketCount',
        });
    }

    async getPredictionMarketsForStud(
        studId: bigint,
    ) {
        return this.client.readContract({
            address:
                this.predictionMarketFactoryAddress,
            abi: predictionFactoryAbi,
            functionName:
                'getMarketsByStudId',
            args: [studId],
        });
    }

    async getPredictionMarketDetails(
        marketAddress: Address,
    ) {
        const address =
            getAddress(marketAddress);

        const [
            subject,
            studId,
            question,
            closesAt,
            resolver,
            quoteToken,
            outcome,
            yesPool,
            noPool,
            yesProbabilityBps,
            noProbabilityBps,
            totalPool,
        ] = await Promise.all([
            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'subject',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'studId',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'question',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'closesAt',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'resolver',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'quoteToken',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'outcome',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'yesPool',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'noPool',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'yesProbabilityBps',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'noProbabilityBps',
            }),

            this.client.readContract({
                address,
                abi: predictionMarketAbi,
                functionName: 'totalPool',
            }),
        ]);

        return {
            address,
            subject,
            studId,
            question,
            closesAt,
            resolver,
            quoteToken,
            outcome,
            yesPool,
            noPool,
            yesProbabilityBps,
            noProbabilityBps,
            totalPool,
        };
    }

    async getPairMarketDetails(
        marketAddress: Address,
    ) {
        const address =
            getAddress(marketAddress);

        const [
            pairId,
            pairToken,
            quoteToken,
            reserve,
            currentPrice,
            totalSupply,
            marketCapacity,
            graduationEligible,
            basePrice,
            slope,
        ] = await Promise.all([
            this.client.readContract({
                address,
                abi: pairMarketAbi,
                functionName: 'pairId',
            }),

            this.client.readContract({
                address,
                abi: pairMarketAbi,
                functionName: 'pairToken',
            }),

            this.client.readContract({
                address,
                abi: pairMarketAbi,
                functionName: 'quoteToken',
            }),

            this.client.readContract({
                address,
                abi: pairMarketAbi,
                functionName: 'reserve',
            }),

            this.client.readContract({
                address,
                abi: pairMarketAbi,
                functionName: 'currentPrice',
            }),

            this.client.readContract({
                address,
                abi: pairMarketAbi,
                functionName: 'totalSupply',
            }),

            this.client.readContract({
                address,
                abi: pairMarketAbi,
                functionName: 'marketCapacity',
            }),

            this.client.readContract({
                address,
                abi: pairMarketAbi,
                functionName:
                    'isGraduationEligible',
            }),

            this.client.readContract({
                address,
                abi: pairMarketAbi,
                functionName: 'basePrice',
            }),

            this.client.readContract({
                address,
                abi: pairMarketAbi,
                functionName: 'slope',
            }),
        ]);

        return {
            address,
            pairId,
            pairToken,
            quoteToken,
            reserve,
            currentPrice,
            totalSupply,
            marketCapacity,
            graduationEligible,
            basePrice,
            slope,
        };
    }

    async createPredictionMarket(
        subject: Address,
        question: string,
        closesAt: bigint,
    ) {
        const hash =
            await this.walletClient.writeContract({
                address:
                    this.predictionMarketFactoryAddress,

                abi:
                    predictionFactoryWriteAbi,

                functionName:
                    'createMarket',

                args: [
                    getAddress(subject),
                    question,
                    closesAt,
                ],

                account:
                    this.marketCreatorAccount,
            });

        const receipt =
            await this.client
                .waitForTransactionReceipt({
                    hash,
                });

        const marketCount =
            await this
                .getPredictionMarketCount();

        const marketAddress =
            await this
                .getPredictionMarket(
                    marketCount,
                );

        return {
            hash,
            blockNumber:
                receipt.blockNumber,
            status:
                receipt.status,
            marketId:
                marketCount,
            marketAddress,
        };
    }

    async resolvePredictionMarket(
  marketId: bigint,
  outcome: 1 | 2,
) {
  const marketAddress =
    await this.getPredictionMarket(
      marketId,
    );

  const hash =
    await this.walletClient.writeContract({
      address: marketAddress,

      abi:
        predictionMarketWriteAbi,

      functionName:
        'resolve',

      args: [
        outcome,
      ],

      account:
        this.marketCreatorAccount,
    });

  const receipt =
    await this.client
      .waitForTransactionReceipt({
        hash,
      });

  return {
    hash,
    blockNumber:
      receipt.blockNumber,
    status:
      receipt.status,
    marketAddress,
    outcome,
  };
}
}