import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SeedProfile, profileSeed } from './seed.data';

export interface SeedResult {
  profileId: string;
  slug: string;
  contacts: number;
  skills: number;
  experience: number;
  projects: number;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotent: the seed file is the source of truth for the card.
   * Everything is replaced inside one transaction, so a failed seed never
   * leaves a half-filled profile behind.
   */
  async seed(card: SeedProfile = profileSeed): Promise<SeedResult> {
    const contacts = card.contacts.map((contact, index) => ({
      ...contact,
      sortOrder: index + 1,
    }));

    const skills = card.skills.map((skill, index) => ({
      ...skill,
      sortOrder: index + 1,
    }));

    const experience = card.experience.map((item, index) => ({
      company: item.company,
      position: item.position,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location ?? null,
      summary: item.summary ?? null,
      sortOrder: index + 1,
      achievements: {
        create: item.achievements.map((text, achievementIndex) => ({
          text,
          sortOrder: achievementIndex + 1,
        })),
      },
    }));

    const projects = card.projects.map((project, index) => ({
      ...project,
      sortOrder: index + 1,
    }));

    const scalars = {
      slug: card.slug,
      name: card.name,
      headline: card.headline,
      description: card.description,
      location: card.location ?? null,
      email: card.email ?? null,
      avatarUrl: card.avatarUrl ?? null,
      isPrimary: card.isPrimary,
    };

    const profile = await this.prisma.$transaction(async (tx) => {
      await tx.profile.deleteMany({ where: { slug: { not: card.slug } } });

      return tx.profile.upsert({
        where: { slug: card.slug },
        create: {
          ...scalars,
          contacts: { create: contacts },
          skills: { create: skills },
          experience: { create: experience },
          projects: { create: projects },
        },
        update: {
          ...scalars,
          contacts: { deleteMany: {}, create: contacts },
          skills: { deleteMany: {}, create: skills },
          experience: { deleteMany: {}, create: experience },
          projects: { deleteMany: {}, create: projects },
        },
      });
    });

    const result: SeedResult = {
      profileId: profile.id,
      slug: profile.slug,
      contacts: contacts.length,
      skills: skills.length,
      experience: experience.length,
      projects: projects.length,
    };

    this.logger.log(
      `Профиль «${result.slug}»: ${result.skills} навыков, ` +
        `${result.experience} мест работы, ${result.projects} проектов, ` +
        `${result.contacts} ссылок`,
    );

    return result;
  }
}
