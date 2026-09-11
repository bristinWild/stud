import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
    getAddress,
    isAddress,
    type Address,
    type Hex,
    createPublicClient,
    http,
} from 'viem';

import {
    privateKeyToAccount,
} from 'viem/accounts';

@Injectable()
export class PairAuthorizationService {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    async createAuthorization(
        firstWallet: string,
        secondWallet: string,
    ) {
        if (
            !isAddress(firstWallet) ||
            !isAddress(secondWallet)
        ) {
            throw new BadRequestException(
                'Both Pair members must be valid wallet addresses',
            );
        }

        if (
            firstWallet.toLowerCase() ===
            secondWallet.toLowerCase()
        ) {
            throw new BadRequestException(
                'A Stud cannot form a Pair with themselves',
            );
        }

        const privateKey =
            this.configService.get<string>(
                'PAIR_AUTH_SIGNER_PRIVATE_KEY',
            ) as Hex | undefined;

        const pairRegistryAddress =
            this.configService.get<string>(
                'PAIR_REGISTRY_ADDRESS',
            ) as Address | undefined;

        const chainId = Number(
            this.configService.get<string>(
                'WORLD_CHAIN_ID',
            ),
        );

        if (!privateKey) {
            throw new InternalServerErrorException(
                'PAIR_AUTH_SIGNER_PRIVATE_KEY is not configured',
            );
        }

        if (
            !pairRegistryAddress ||
            !isAddress(pairRegistryAddress)
        ) {
            throw new InternalServerErrorException(
                'PAIR_REGISTRY_ADDRESS is not configured',
            );
        }

        if (!chainId) {
            throw new InternalServerErrorException(
                'WORLD_CHAIN_ID is not configured',
            );
        }

        const walletA = getAddress(firstWallet);
        const walletB = getAddress(secondWallet);

        /*
         * Must use the same canonical ordering
         * as PairRegistry._sortMembers().
         */
        const [memberA, memberB] =
            BigInt(walletA) < BigInt(walletB)
                ? [walletA, walletB]
                : [walletB, walletA];

        const rpcUrl =
            this.configService.get<string>(
                'WORLD_CHAIN_RPC_URL',
            ) ??
            'http://127.0.0.1:8545';

        const publicClient =
            createPublicClient({
                transport: http(rpcUrl),
            });

        const pendingBlock =
            await publicClient.getBlock({
                blockTag: 'pending',
            });

        const deadline =
            pendingBlock.timestamp +
            60n * 60n;

        const account =
            privateKeyToAccount(privateKey);

        const signature =
            await account.signTypedData({
                domain: {
                    name: 'PairRegistry',
                    version: '1',
                    chainId,
                    verifyingContract:
                        pairRegistryAddress,
                },

                types: {
                    CreatePair: [
                        {
                            name: 'memberA',
                            type: 'address',
                        },
                        {
                            name: 'memberB',
                            type: 'address',
                        },
                        {
                            name: 'deadline',
                            type: 'uint256',
                        },
                    ],
                },

                primaryType: 'CreatePair',

                message: {
                    memberA,
                    memberB,
                    deadline,
                },
            });

        return {
            memberA,
            memberB,
            deadline: deadline.toString(),
            signature,
            signer: account.address,
        };
    }
}