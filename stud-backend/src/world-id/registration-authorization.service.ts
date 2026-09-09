import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
    Address,
    Hex,
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
        const deadline =
            BigInt(
                Math.floor(Date.now() / 1000) +
                10 * 60,
            );

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