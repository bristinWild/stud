import {
  NestFactory,
} from '@nestjs/core';

import {
  NestExpressApplication,
} from '@nestjs/platform-express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app =
    await NestFactory.create<
      NestExpressApplication
    >(
      AppModule,
    );

  app.useBodyParser(
    'json',
    {
      limit:
        '8mb',
    },
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  });

  const port =
    process.env.PORT || 3001;

  await app.listen(port);

  console.log(
    `Stud backend running on http://localhost:${port}`,
  );
}

bootstrap();