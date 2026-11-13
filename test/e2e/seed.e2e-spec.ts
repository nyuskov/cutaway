import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/database/prisma.service';
import { profileSeed } from '../../src/seed/seed.data';
import { SeedService } from '../../src/seed/seed.service';
import { createTestApp, graphql } from './test-app';

describe('Seeding (e2e)', () => {
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

  async function counts() {
    const [profiles, contacts, skills, experience, achievements, projects] = await Promise.all([
      prisma.profile.count(),
      prisma.contact.count(),
      prisma.skill.count(),
      prisma.experience.count(),
      prisma.achievement.count(),
      prisma.project.count(),
    ]);

    return { profiles, contacts, skills, experience, achievements, projects };
  }

  it('creates exactly the card from the seed file', async () => {
    await expect(counts()).resolves.toEqual({
      profiles: 1,
      contacts: profileSeed.contacts.length,
      skills: profileSeed.skills.length,
      experience: profileSeed.experience.length,
      achievements: profileSeed.experience.reduce(
        (total, item) => total + item.achievements.length,
        0,
      ),
      projects: profileSeed.projects.length,
    });
  });

  it('can be executed repeatedly without duplicates', async () => {
    const before = await counts();

    await seed.seed();
    await seed.seed();

    await expect(counts()).resolves.toEqual(before);
  });

  it('removes stale profiles and keeps a single primary card', async () => {
    await prisma.profile.create({
      data: {
        slug: 'stale-card',
        name: 'Устаревшая визитка',
        headline: 'Не должна остаться',
        description: 'Профиль вне сида.',
        isPrimary: false,
      },
    });

    await seed.seed();

    const profiles = await prisma.profile.findMany();
    expect(profiles.map((profile) => profile.slug)).toEqual([profileSeed.slug]);
    expect(profiles.filter((profile) => profile.isPrimary)).toHaveLength(1);
  });

  it('keeps the primary profile first when extra profiles exist', async () => {
    await prisma.profile.create({
      data: {
        slug: 'a-secondary-card',
        name: 'Дополнительная визитка',
        headline: 'Вторичная',
        description: 'Не должна выбираться как основная.',
        isPrimary: false,
      },
    });

    const response = await graphql(app, '{ profile { slug } }');

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.profile.slug).toBe(profileSeed.slug);
  });
});
