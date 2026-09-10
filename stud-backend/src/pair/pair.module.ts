import { Module } from '@nestjs/common';

import { PairController } from './pair.controller.js';

import {
  PairAuthorizationService,
} from './pair-authorization.service.js';

@Module({
  controllers: [PairController],
  providers: [PairAuthorizationService],
})
export class PairModule { }