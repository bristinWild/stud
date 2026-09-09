import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  WorldIdController,
} from './world-id.controller.js';

import {
  WorldIdService,
} from './world-id.service.js';

import {
  RegistrationAuthorizationService,
} from './registration-authorization.service.js';

import {
  WorldIdVerificationService,
} from './world-id-verification.service.js';

import {
  WorldIdVerification,
} from './entities/world-id-verification.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorldIdVerification,
    ]),
  ],

  controllers: [
    WorldIdController,
  ],

  providers: [
    WorldIdService,
    RegistrationAuthorizationService,
    WorldIdVerificationService,
  ],
})
export class WorldIdModule { }