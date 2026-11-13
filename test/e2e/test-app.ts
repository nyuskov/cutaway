import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { SeedModule } from '../../src/seed/seed.module';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule, SeedModule],
  }).compile();

  const app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();

  return app;
}

export function graphql(
  app: INestApplication,
  query: string,
  variables?: Record<string, unknown>,
): request.Test {
  return request(app.getHttpServer()).post('/graphql').send({ query, variables }).expect(200);
}
