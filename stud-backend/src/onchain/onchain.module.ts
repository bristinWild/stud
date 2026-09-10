import { Module } from '@nestjs/common';

import { OnchainController } from './onchain.controller.js';
import { OnchainService } from './onchain.service.js';

@Module({
    controllers: [
        OnchainController,
    ],
    providers: [
        OnchainService,
    ],
    exports: [
        OnchainService,
    ],
})
export class OnchainModule { }