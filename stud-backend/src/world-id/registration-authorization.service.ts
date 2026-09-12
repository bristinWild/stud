import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
    Address,
    Hex,
    createPublicClient,
    http,
} from 'viem';


import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class RegistrationAuthorizationService {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    async createAuthorization(
        wallet: Address,
        nullifierHash: Hex,
    ) {
        const privateKey =
            this.configService.get<string>(
                'CONTRACT_AUTH_SIGNER_PRIVATE_KEY',
            ) as Hex | undefined;

        const registryAddress =
            this.configService.get<string>(
                'STUD_REGISTRY_ADDRESS',
            ) as Address | undefined;

        const chainId = Number(
            this.configService.get<string>(
                'WORLD_CHAIN_ID',
            ),
        );

        if (!privateKey) {
            throw new InternalServerErrorException(
                'CONTRACT_AUTH_SIGNER_PRIVATE_KEY is not configured',
            );
        }

        if (!registryAddress) {
            throw new InternalServerErrorException(
                'STUD_REGISTRY_ADDRESS is not configured',
            );
        }

        if (!chainId) {
            throw new InternalServerErrorException(
                'WORLD_CHAIN_ID is not configured',
            );
        }

        const account =
            privateKeyToAccount(privateKey);

        // Authorization valid for 10 minutes.
        const rpcUrl =
            this.configService.get<string>(
                'RPC_URL',
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

        const signature =
            await account.signTypedData({
                domain: {
                    name: 'StudRegistry',
                    version: '1',
                    chainId,
                    verifyingContract:
                        registryAddress,
                },

                types: {
                    RegisterStud: [
                        {
                            name: 'wallet',
                            type: 'address',
                        },
                        {
                            name: 'nullifierHash',
                            type: 'bytes32',
                        },
                        {
                            name: 'deadline',
                            type: 'uint256',
                        },
                    ],
                },

                primaryType: 'RegisterStud',

                message: {
                    wallet,
                    nullifierHash,
                    deadline,
                },
            });

        return {
            wallet,
            nullifierHash,
            deadline:
                deadline.toString(),
            signature,
            signer: account.address,
        };
    }
}