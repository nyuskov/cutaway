import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/database/prisma.service';
import { SeedService } from '../../src/seed/seed.service';
import { createTestApp, graphql } from './test-app';

describe('API security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
    const prisma = app.get(PrismaService);
    await prisma.profile.deleteMany();
    await app.get(SeedService).seed();
  });

  afterAll(async () => {
    await app.close();
  });

  it('sets defensive HTTP headers and hides the server signature', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
    expect(response.headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('redirects the site root to Sandbox', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(302);

    expect(response.headers.location).toBe('graphql');
  });

  it('serves Apollo Sandbox for browsers', async () => {
    const response = await request(app.getHttpServer())
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200);

    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('Apollo Sandbox');
  });

  it('enables introspection, which the public card needs', async () => {
    const response = await graphql(app, '{ __schema { types { name } } }');

    expect(response.body.errors).toBeUndefined();
    const typeNames = response.body.data.__schema.types.map((type: { name: string }) => type.name);
    expect(typeNames).toEqual(expect.arrayContaining(['Profile', 'Experience', 'Project']));
  });

  it('exposes no mutations', async () => {
    const response = await graphql(
      app,
      '{ __schema { mutationType { name } queryType { name } } }',
    );

    expect(response.body.data.__schema.mutationType).toBeNull();
    expect(response.body.data.__schema.queryType.name).toBe('Query');
  });

  it('answers CORS preflight requests', async () => {
    const response = await request(app.getHttpServer())
      .options('/graphql')
      .set('Origin', 'https://example.com')
      .set('Access-Control-Request-Method', 'POST')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe('https://example.com');
  });
});
