import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';

import {
    ConfigService,
} from '@nestjs/config';

import {
    InjectRepository,
} from '@nestjs/typeorm';

import {
    Repository,
} from 'typeorm';

import {
    createPublicClient,
    getAddress,
    http,
    isAddress,
    type Address,
} from 'viem';

import {
    StudProfile,
} from './entities/stud-profile.entity.js';


type Gender =
    | 'Man'
    | 'Woman';


export type SaveProfileInput = {
    wallet: string;
    name: string;
    age: number;
    gender: Gender;
    bio?: string;
    interests: string[];
    profileImage: string;
};


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


@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(
            StudProfile,
        )
        private readonly repository:
            Repository<StudProfile>,

        private readonly configService:
            ConfigService,
    ) { }


    private async getOnchainStud(
        wallet: Address,
    ) {
        const rpcUrl =
            this.configService.get<string>(
                'RPC_URL',
            ) ??
            'http://127.0.0.1:8545';

        const registryAddress =
            this.configService.get<string>(
                'STUD_REGISTRY_ADDRESS',
            );

        if (
            !registryAddress ||
            !isAddress(
                registryAddress,
            )
        ) {
            throw new BadRequestException(
                'STUD_REGISTRY_ADDRESS is not configured',
            );
        }

        const publicClient =
            createPublicClient({
                transport:
                    http(
                        rpcUrl,
                    ),
            });

        const [
            verified,
            studId,
        ] =
            await Promise.all([
                publicClient
                    .readContract({
                        address:
                            getAddress(
                                registryAddress,
                            ),

                        abi:
                            studRegistryAbi,

                        functionName:
                            'isVerifiedStud',

                        args: [
                            wallet,
                        ],
                    }),

                publicClient
                    .readContract({
                        address:
                            getAddress(
                                registryAddress,
                            ),

                        abi:
                            studRegistryAbi,

                        functionName:
                            'getStudId',

                        args: [
                            wallet,
                        ],
                    }),
            ]);

        return {
            verified,
            studId:
                Number(
                    studId,
                ),
        };
    }


    async saveProfile(
        input:
            SaveProfileInput,
    ) {
        if (
            !input.wallet ||
            !isAddress(
                input.wallet,
            )
        ) {
            throw new BadRequestException(
                'Valid wallet is required',
            );
        }

        const wallet =
            getAddress(
                input.wallet,
            );

        const normalizedWallet =
            wallet.toLowerCase();


        const name =
            input.name
                ?.trim();

        if (
            !name ||
            name.length < 2 ||
            name.length > 64
        ) {
            throw new BadRequestException(
                'Name must be between 2 and 64 characters',
            );
        }


        const age =
            Number(
                input.age,
            );

        if (
            !Number.isInteger(
                age,
            ) ||
            age < 18 ||
            age > 120
        ) {
            throw new BadRequestException(
                'Age must be at least 18',
            );
        }


        if (
            input.gender !==
            'Man' &&
            input.gender !==
            'Woman'
        ) {
            throw new BadRequestException(
                'Invalid gender',
            );
        }


        const preference:
            Gender =
            input.gender ===
                'Man'
                ? 'Woman'
                : 'Man';


        const bio =
            (
                input.bio ??
                ''
            )
                .trim()
                .slice(
                    0,
                    280,
                );


        const interests =
            Array.from(
                new Set(
                    (
                        input.interests ??
                        []
                    )
                        .map(
                            (
                                interest,
                            ) =>
                                interest
                                    .trim(),
                        )
                        .filter(
                            Boolean,
                        ),
                ),
            )
                .slice(
                    0,
                    5,
                );


        if (
            interests.length ===
            0
        ) {
            throw new BadRequestException(
                'Choose at least one interest',
            );
        }


        if (
            !input.profileImage ||
            !input.profileImage.startsWith(
                'data:image/',
            )
        ) {
            throw new BadRequestException(
                'Profile image is required',
            );
        }


        /*
         * Never trust the browser when it
         * says somebody is World verified.
         *
         * Confirm registration directly
         * against StudRegistry.
         */
        const onchain =
            await this
                .getOnchainStud(
                    wallet,
                );


        if (
            !onchain.verified ||
            onchain.studId ===
            0
        ) {
            throw new ForbiddenException(
                'Wallet is not a verified onchain Stud',
            );
        }


        /*
         * Prevent a Stud ID from being attached
         * to another wallet profile.
         */
        const profileForStudId =
            await this.repository
                .findOne({
                    where: {
                        studId:
                            onchain.studId,
                    },
                });


        if (
            profileForStudId &&
            profileForStudId.wallet !==
            normalizedWallet
        ) {
            throw new ForbiddenException(
                'Stud ID is already associated with another wallet',
            );
        }


        const existing =
            await this.repository
                .findOne({
                    where: {
                        wallet:
                            normalizedWallet,
                    },
                });


        if (
            existing
        ) {
            existing.studId =
                onchain.studId;

            existing.name =
                name;

            existing.age =
                age;

            existing.gender =
                input.gender;

            existing.preference =
                preference;

            existing.bio =
                bio;

            existing.interests =
                interests;

            existing.profileImage =
                input.profileImage;

            return this.repository
                .save(
                    existing,
                );
        }


        const profile =
            this.repository
                .create({
                    studId:
                        onchain.studId,

                    wallet:
                        normalizedWallet,

                    name,

                    age,

                    gender:
                        input.gender,

                    preference,

                    bio,

                    interests,

                    profileImage:
                        input.profileImage,
                });


        return this.repository
            .save(
                profile,
            );
    }


    async getProfileByWallet(
        wallet:
            string,
    ) {
        if (
            !isAddress(
                wallet,
            )
        ) {
            throw new BadRequestException(
                'Invalid wallet',
            );
        }

        return this.repository
            .findOne({
                where: {
                    wallet:
                        wallet
                            .toLowerCase(),
                },
            });
    }


    async getDiscoverProfiles(
        wallet:
            string,
    ) {
        if (
            !isAddress(
                wallet,
            )
        ) {
            throw new BadRequestException(
                'Invalid wallet',
            );
        }

        const normalizedWallet =
            wallet
                .toLowerCase();


        const viewer =
            await this.repository
                .findOne({
                    where: {
                        wallet:
                            normalizedWallet,
                    },
                });


        const profiles =
            await this.repository
                .find({
                    order: {
                        createdAt:
                            'DESC',
                    },
                });


        return profiles
            .filter(
                (
                    profile,
                ) =>
                    profile.wallet !==
                    normalizedWallet,
            )
            .filter(
                (
                    profile,
                ) =>
                    !viewer ||
                    profile.gender ===
                    viewer.preference,
            );
    }
}