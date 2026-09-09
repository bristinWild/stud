import {
    Body,
    Controller,
    Post,
} from '@nestjs/common';

import {
    WorldIdService,
} from './world-id.service.js';

import {
    RegistrationAuthorizationService,
} from './registration-authorization.service.js';

import type {
    Address,
    Hex,
} from 'viem';

type IDKitResponse = {
    protocol_version?: string;
    nonce?: string;
    action?: string;
    environment?: string;

    responses?: Array<{
        identifier?: string;
        signal_hash?: string;
        nullifier?: string;

        [key: string]: unknown;
    }>;

    [key: string]: unknown;
};

@Controller('world-id')
export class WorldIdController {
    constructor(
        private readonly worldIdService:
            WorldIdService,

        /*
         * Only needed temporarily for our
         * dev-authorization endpoint.
         */
        private readonly registrationAuthorization:
            RegistrationAuthorizationService,
    ) { }

    @Post('rp-signature')
    getRpSignature() {
        return this.worldIdService
            .createRegistrationRpSignature();
    }


    @Post('verify-and-authorize')
    verifyAndAuthorize(
        @Body()
        body: {
            wallet: string;
            idkitResponse: IDKitResponse;
        },
    ) {
        if (!body) {
            return this.worldIdService
                .verifyAndAuthorizeRegistration(
                    '',
                    {} as IDKitResponse,
                );
        }

        return this.worldIdService
            .verifyAndAuthorizeRegistration(
                body.wallet,
                body.idkitResponse,
            );
    }


    @Post('dev-authorization')
    createDevAuthorization(
        @Body()
        body: {
            wallet: Address;
            nullifierHash: Hex;
        },
    ) {
        return this.registrationAuthorization
            .createAuthorization(
                body.wallet,
                body.nullifierHash,
            );
    }
}