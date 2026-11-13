import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');

  Logger.log('Apollo Sandbox: /graphql', 'Bootstrap');
  Logger.log('Healthcheck:    /health', 'Bootstrap');
}

void bootstrap();
