import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { signRequest } from '@worldcoin/idkit-core/signing';
import { hashSignal } from '@worldcoin/idkit-core/hashing';

import {
    isAddress,
    type Address,
    type Hex,
} from 'viem';

import {
    RegistrationAuthorizationService,
} from './registration-authorization.service.js';
import { WorldIdVerificationService } from './world-id-verification.service.js';

type IDKitProofResponse = {
    identifier?: string;
    signal_hash?: string;
    nullifier?: string;
    [key: string]: unknown;
};

type IDKitResponse = {
    protocol_version?: string;
    nonce?: string;
    action?: string;
    environment?: string;

    responses?: IDKitProofResponse[];

    [key: string]: unknown;
};

type WorldVerificationResult = {
    identifier?: string;
    success?: boolean;
    nullifier?: string;
    code?: string;
    detail?: string;
};

type WorldVerificationResponse = {
    success: boolean;
    results?: WorldVerificationResult[];
    action?: string;
    nullifier?: string;
};

@Injectable()
export class WorldIdService {
    /*
     * TEMPORARY.
     *
     * This prevents replay while running a single
     * Nest process.
     *
     * We will replace this with PostgreSQL.
     */


    constructor(
        private readonly configService: ConfigService,

        private readonly registrationAuthorization:
            RegistrationAuthorizationService,

        private readonly verificationStore:
            WorldIdVerificationService,
    ) { }


    createRegistrationRpSignature() {
        const signingKey =
            this.configService.get<string>(
                'WORLD_RP_SIGNING_KEY',
            );

        if (!signingKey) {
            throw new InternalServerErrorException(
                'WORLD_RP_SIGNING_KEY is not configured',
            );
        }

        const {
            sig,
            nonce,
            createdAt,
            expiresAt,
        } = signRequest({
            signingKeyHex: signingKey,
            action: 'register-stud',
        });

        return {
            sig,
            nonce,
            created_at: createdAt,
            expires_at: expiresAt,
        };
    }



    async verifyAndAuthorizeRegistration(
        wallet: string,
        idkitResponse: IDKitResponse,
    ) {


        if (!wallet || !isAddress(wallet)) {
            throw new BadRequestException(
                'Valid wallet address is required',
            );
        }

        const walletAddress =
            wallet as Address;

        /*
         * IMPORTANT:
         *
         * We use the LOWERCASE wallet address
         * as the canonical World ID signal.
         *
         * The frontend must later use the same:
         *
         * signal: walletAddress.toLowerCase()
         */
        const canonicalSignal =
            walletAddress.toLowerCase();


        if (
            !idkitResponse ||
            typeof idkitResponse !== 'object'
        ) {
            throw new BadRequestException(
                'IDKit response is required',
            );
        }

        if (
            idkitResponse.action !==
            'register-stud'
        ) {
            throw new BadRequestException(
                'Invalid World ID action',
            );
        }

        if (
            !Array.isArray(
                idkitResponse.responses,
            ) ||
            idkitResponse.responses.length === 0
        ) {
            throw new BadRequestException(
                'World ID response contains no proofs',
            );
        }


        const expectedSignalHash =
            hashSignal(canonicalSignal);

        const signalMatches =
            idkitResponse.responses.some(
                (response) =>
                    response.signal_hash
                        ?.toLowerCase() ===
                    expectedSignalHash.toLowerCase(),
            );

        if (!signalMatches) {
            throw new BadRequestException(
                'World ID proof is not bound to this wallet',
            );
        }



        const rpId =
            this.configService.get<string>(
                'WORLD_RP_ID',
            );

        if (!rpId) {
            throw new InternalServerErrorException(
                'WORLD_RP_ID is not configured',
            );
        }


        let response: Response;

        try {
            response = await fetch(
                `https://developer.world.org/api/v4/verify/${encodeURIComponent(
                    rpId,
                )}`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',
                    },

                    /*
                     * World explicitly expects the
                     * IDKit result payload as-is.
                     */
                    body: JSON.stringify(
                        idkitResponse,
                    ),
                },
            );
        } catch (error) {
            console.error(
                'World verification request failed:',
                error,
            );

            throw new InternalServerErrorException(
                'Unable to contact World verification service',
            );
        }

        let verification:
            WorldVerificationResponse;

        try {
            verification =
                (await response.json()) as
                WorldVerificationResponse;
        } catch {
            throw new InternalServerErrorException(
                'Invalid response from World verification service',
            );
        }


        if (
            !response.ok ||
            !verification.success
        ) {
            console.error(
                'World ID verification failed:',
                verification,
            );

            throw new BadRequestException(
                'World ID verification failed',
            );
        }

        if (
            verification.action &&
            verification.action !==
            'register-stud'
        ) {
            throw new BadRequestException(
                'Verified World ID action mismatch',
            );
        }


        const nullifier =
            verification.nullifier ??
            verification.results?.find(
                (result) =>
                    result.success &&
                    result.nullifier,
            )?.nullifier;

        if (!nullifier) {
            throw new InternalServerErrorException(
                'Verified World ID proof did not return a nullifier',
            );
        }

        if (
            !/^0x[0-9a-fA-F]{64}$/.test(
                nullifier,
            )
        ) {
            throw new InternalServerErrorException(
                'World returned an invalid nullifier',
            );
        }


        /*
         * Convert to decimal representation.
         *
         * This avoids differences caused by
         * hex casing/formatting.
         *
         * We'll store this exact representation
         * in PostgreSQL later.
         */
        const nullifierDecimal =
            BigInt(nullifier).toString(10);

        await this.verificationStore
            .recordVerification(
                'register-stud',
                nullifierDecimal,
                walletAddress,
            );

        try {
            const authorization =
                await this.registrationAuthorization
                    .createAuthorization(
                        walletAddress,
                        nullifier as Hex,
                    );

            return {
                success: true,

                worldId: {
                    action: 'register-stud',
                    nullifier,
                },

                authorization,
            };
        } catch (error) {
            /*
             * Since we're only using an in-memory
             * Set right now, roll it back if signing
             * fails.
             */

            throw error;
        }
    }
}