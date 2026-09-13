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
          configService.getOrThrow<string>('DB_HOST');

        const port = Number(
          configService.getOrThrow<string>('DB_PORT'),
        );

        const username =
          configService.getOrThrow<string>('DB_USER');

        const password =
          configService.getOrThrow<string>('DB_PASSWORD');

        const database =
          configService.getOrThrow<string>('DB_NAME');

        console.log(
          'DATABASE CONNECTION:',
          host,
          port,
          database,
        );

        return {
          type: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,

          ssl: {
            rejectUnauthorized: false,
          },

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