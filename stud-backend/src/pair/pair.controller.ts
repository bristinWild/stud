import {
    Body,
    Controller,
    Post,
} from '@nestjs/common';

import {
    PairAuthorizationService,
} from './pair-authorization.service.js';

@Controller('pairs')
export class PairController {
    constructor(
        private readonly pairAuthorization:
            PairAuthorizationService,
    ) { }

    /*
     * TEMPORARY DEV ENDPOINT.
     *
     * Later this will only be called after
     * NestJS detects a real mutual match.
     */
    @Post('dev-authorization')
    createDevAuthorization(
        @Body()
        body: {
            memberA: string;
            memberB: string;
        },
    ) {
        return this.pairAuthorization
            .createAuthorization(
                body.memberA,
                body.memberB,
            );
    }
}