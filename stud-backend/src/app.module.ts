import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { WorldIdModule } from './world-id/world-id.module.js';

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
      ) => ({
        type: 'postgres' as const,

        url: configService.getOrThrow<string>(
          'DATABASE_URL',
        ),

        autoLoadEntities: true,

        // Fine for local hackathon development.
        // We'll replace with migrations before production.
        synchronize: true,
      }),
    }),

    WorldIdModule,
  ],
})
export class AppModule { }