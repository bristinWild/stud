import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { WorldIdModule } from './world-id/world-id.module.js';
import { PairModule } from './pair/pair.module.js';
import { OnchainModule } from './onchain/onchain.module.js';
import {
  ProfileModule,
} from './profile/profile.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => {
        const host =
          configService.getOrThrow<string>(
            'PGHOST',
          );

        const port = Number(
          configService.getOrThrow<string>(
            'PGPORT',
          ),
        );

        const username =
          configService.getOrThrow<string>(
            'PGUSER',
          );

        const password =
          configService.getOrThrow<string>(
            'PGPASSWORD',
          );

        const database =
          configService.getOrThrow<string>(
            'PGDATABASE',
          );

        console.log(
          'DATABASE HOST:',
          host,
          port,
        );

        return {
          type: 'postgres' as const,

          host,
          port,
          username,
          password,
          database,

          autoLoadEntities: true,

          // Fine for hackathon deployment.
          synchronize: true,
        };
      },
    }),

    WorldIdModule,
    PairModule,
    OnchainModule,
    ProfileModule,
  ],
})
export class AppModule { }