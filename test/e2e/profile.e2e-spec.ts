import { INestApplication } from '@nestjs/common';
import type { Prisma } from '../../src/generated/prisma/client';
import { PrismaService } from '../../src/database/prisma.service';
import { profileSeed } from '../../src/seed/seed.data';
import { SeedService } from '../../src/seed/seed.service';
import { createTestApp, graphql } from './test-app';

const PROFILE_QUERY = `
  query ProfileCard {
    profile {
      id
      name
      headline
      description
      location
      email
      contacts { kind label url }
      skills { name category level }
      experience {
        company
        position
        startDate
        endDate
        achievements { text }
      }
      projects { slug name url tags }
    }
  }
`;

describe('Profile GraphQL API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seed: SeedService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    seed = app.get(SeedService);
  });

  beforeEach(async () => {
    await prisma.profile.deleteMany();
    await seed.seed();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the card with every related collection', async () => {
    const response = await graphql(app, PROFILE_QUERY);

    expect(response.body.errors).toBeUndefined();
    const profile = response.body.data.profile;

    expect(profile.name).toBe(profileSeed.name);
    expect(profile.headline).toBe(profileSeed.headline);
    expect(profile.contacts).toHaveLength(profileSeed.contacts.length);
    expect(profile.skills).toHaveLength(profileSeed.skills.length);
    expect(profile.experience).toHaveLength(profileSeed.experience.length);
    expect(profile.projects).toHaveLength(profileSeed.projects.length);

    const firstJob = profile.experience[0];
    expect(firstJob.company).toBe('Рабочие Руки');
    expect(firstJob.achievements).toHaveLength(3);
    expect(firstJob.endDate).toMatch(/^2026-06-01T00:00:00\.000Z$/);
  });

  it('keeps the order defined by the seed', async () => {
    const response = await graphql(app, PROFILE_QUERY);
    const profile = response.body.data.profile;

    expect(profile.skills[0]).toMatchObject({ name: 'TypeScript', category: 'Языки' });
    expect(profile.experience.map((item: { company: string }) => item.company)).toEqual(
      profileSeed.experience.map((item) => item.company),
    );
    expect(profile.projects.map((item: { slug: string }) => item.slug)).toEqual(
      profileSeed.projects.map((item) => item.slug),
    );
  });

  it('finds a project by slug and returns null for an unknown one', async () => {
    const found = await graphql(app, '{ project(slug: "cutaway") { name url tags } }');
    expect(found.body.data.project).toMatchObject({
      name: 'cutaway',
      url: 'https://github.com/nyuskov/cutaway',
    });

    const missing = await graphql(app, '{ project(slug: "nope") { name } }');
    expect(missing.body.data.project).toBeNull();
  });

  it('reports a missing profile as a GraphQL error', async () => {
    await prisma.profile.deleteMany();

    const response = await graphql(app, '{ profile { name } }');

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toContain('Профиль не найден');
  });

  it('loads nested skills in one batched query for all profiles', async () => {
    await prisma.profile.create({
      data: {
        slug: 'second-card',
        name: 'Вторая визитка',
        headline: 'Проверка пакетной загрузки',
        description: 'Вспомогательный профиль для теста DataLoader.',
        isPrimary: false,
        skills: {
          create: [
            { name: 'Rust', category: 'Языки', level: 'EXPERT', sortOrder: 1 },
            { name: 'Kotlin', category: 'Языки', level: 'INTERMEDIATE', sortOrder: 2 },
          ],
        },
      },
    });

    const statements: string[] = [];
    let collecting = true;
    prisma.$on('query', (event: Prisma.QueryEvent) => {
      if (collecting) {
        statements.push(event.query);
      }
    });

    const response = await graphql(app, '{ profiles { id skills { name } } }');

    collecting = false;

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.profiles).toHaveLength(2);

    const profileQueries = statements.filter((sql) => sql.includes('FROM "public"."Profile"'));
    const skillQueries = statements.filter((sql) => sql.includes('FROM "public"."Skill"'));

    expect(profileQueries).toHaveLength(1);
    expect(skillQueries).toHaveLength(1);
  });
});
