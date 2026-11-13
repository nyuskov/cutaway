import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  AchievementModel as Achievement,
  ContactModel as Contact,
  ExperienceModel as Experience,
  ProfileModel as Profile,
  ProjectModel as Project,
  SkillModel as Skill,
} from '../generated/prisma/models';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPrimary(): Promise<Profile | null> {
    // One query for both rules: a primary profile wins, otherwise the oldest one.
    return this.prisma.profile.findFirst({
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  findMany(): Promise<Profile[]> {
    return this.prisma.profile.findMany({
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  findProjectBySlug(slug: string): Promise<Project | null> {
    return this.prisma.project.findUnique({ where: { slug } });
  }

  findContactsByProfileIds(profileIds: string[]): Promise<Contact[]> {
    if (profileIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.contact.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findSkillsByProfileIds(profileIds: string[]): Promise<Skill[]> {
    if (profileIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.skill.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findExperienceByProfileIds(profileIds: string[]): Promise<Experience[]> {
    if (profileIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.experience.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: [{ startDate: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  findProjectsByProfileIds(profileIds: string[]): Promise<Project[]> {
    if (profileIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.project.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAchievementsByExperienceIds(experienceIds: string[]): Promise<Achievement[]> {
    if (experienceIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.achievement.findMany({
      where: { experienceId: { in: experienceIds } },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
