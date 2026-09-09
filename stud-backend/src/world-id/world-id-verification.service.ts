import {
    ConflictException,
    Injectable,
} from '@nestjs/common';

import {
    InjectRepository,
} from '@nestjs/typeorm';

import {
    Repository,
} from 'typeorm';

import {
    WorldIdVerification,
} from './entities/world-id-verification.entity.js';

@Injectable()
export class WorldIdVerificationService {
    constructor(
        @InjectRepository(
            WorldIdVerification,
        )
        private readonly repository:
            Repository<WorldIdVerification>,
    ) { }

    async recordVerification(
        action: string,
        nullifier: string,
        wallet: string,
    ) {
        const normalizedWallet =
            wallet.toLowerCase();

        /*
         * Has this World ID already been
         * associated with a wallet?
         */
        const existingNullifier =
            await this.repository.findOne({
                where: {
                    action,
                    nullifier,
                },
            });

        if (existingNullifier) {
            throw new ConflictException(
                'This World ID proof has already been used',
            );
        }
        /*
         * Has this wallet already registered
         * using another World identity?
         */
        const existingWallet =
            await this.repository.findOne({
                where: {
                    action,
                    wallet: normalizedWallet,
                },
            });

        if (existingWallet) {
            throw new ConflictException(
                'This wallet is already associated with another World ID',
            );
        }

        const verification =
            this.repository.create({
                action,
                nullifier,
                wallet: normalizedWallet,
            });

        try {
            return await this.repository.save(
                verification,
            );
        } catch (error: unknown) {
            /*
             * PostgreSQL unique violation.
             *
             * Protects us against two requests
             * racing at the same time.
             */
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === '23505'
            ) {
                throw new ConflictException(
                    'World ID verification already exists',
                );
            }

            throw error;
        }
    }
}