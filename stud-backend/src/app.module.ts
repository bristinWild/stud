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
        const databaseUrl =
          configService.getOrThrow<string>(
            'DATABASE_URL',
          );

        const parsed = new URL(databaseUrl);

        console.log(
          'DATABASE HOST:',
          parsed.hostname,
          parsed.port,
        );

        return {
          type: 'postgres' as const,
          url: databaseUrl,
          autoLoadEntities: true,
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