import { PrismaService } from '../../src/database/prisma.service';
import { ProfileRepository } from '../../src/profile/profile.repository';

type PrismaMock = {
  contact: { findMany: jest.Mock };
  skill: { findMany: jest.Mock };
  experience: { findMany: jest.Mock };
  project: { findMany: jest.Mock };
  achievement: { findMany: jest.Mock };
};

describe('ProfileRepository', () => {
  let prisma: PrismaMock;
  let repository: ProfileRepository;

  beforeEach(() => {
    prisma = {
      contact: { findMany: jest.fn() },
      skill: { findMany: jest.fn() },
      experience: { findMany: jest.fn() },
      project: { findMany: jest.fn() },
      achievement: { findMany: jest.fn() },
    };
    repository = new ProfileRepository(prisma as unknown as PrismaService);
  });

  it('skips relation queries when there are no profile ids', async () => {
    await expect(repository.findContactsByProfileIds([])).resolves.toEqual([]);
    await expect(repository.findSkillsByProfileIds([])).resolves.toEqual([]);
    await expect(repository.findExperienceByProfileIds([])).resolves.toEqual([]);
    await expect(repository.findProjectsByProfileIds([])).resolves.toEqual([]);
    await expect(repository.findAchievementsByExperienceIds([])).resolves.toEqual([]);

    expect(prisma.contact.findMany).not.toHaveBeenCalled();
    expect(prisma.skill.findMany).not.toHaveBeenCalled();
    expect(prisma.experience.findMany).not.toHaveBeenCalled();
    expect(prisma.project.findMany).not.toHaveBeenCalled();
    expect(prisma.achievement.findMany).not.toHaveBeenCalled();
  });
});
