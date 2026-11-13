import type { SkillModel as Skill } from '../../src/generated/prisma/models';
import { ProfileLoaders } from '../../src/profile/profile.loaders';
import { ProfileRepository } from '../../src/profile/profile.repository';

type RepositoryMock = {
  findContactsByProfileIds: jest.Mock;
  findSkillsByProfileIds: jest.Mock;
  findExperienceByProfileIds: jest.Mock;
  findProjectsByProfileIds: jest.Mock;
  findAchievementsByExperienceIds: jest.Mock;
};

const empty = () => Promise.resolve([]);

describe('ProfileLoaders', () => {
  let repository: RepositoryMock;
  let loaders: ReturnType<ProfileLoaders['create']>;

  beforeEach(() => {
    repository = {
      findContactsByProfileIds: jest.fn(empty),
      findSkillsByProfileIds: jest.fn(empty),
      findExperienceByProfileIds: jest.fn(empty),
      findProjectsByProfileIds: jest.fn(empty),
      findAchievementsByExperienceIds: jest.fn(empty),
    };
    loaders = new ProfileLoaders(repository as unknown as ProfileRepository).create();
  });

  it('batches relation lookups into a single query', async () => {
    const skills = [
      { id: 's1', profileId: 'p1', name: 'TypeScript' },
      { id: 's2', profileId: 'p1', name: 'Python' },
      { id: 's3', profileId: 'p2', name: 'Go' },
    ] as unknown as Skill[];
    repository.findSkillsByProfileIds.mockResolvedValue(skills);

    const [first, second] = await Promise.all([
      loaders.skillsByProfileId.load('p1'),
      loaders.skillsByProfileId.load('p2'),
    ]);

    expect(repository.findSkillsByProfileIds).toHaveBeenCalledTimes(1);
    expect(repository.findSkillsByProfileIds).toHaveBeenCalledWith(['p1', 'p2']);
    expect(first.map((skill) => skill.name)).toEqual(['TypeScript', 'Python']);
    expect(second.map((skill) => skill.name)).toEqual(['Go']);
  });

  it('returns an empty list for a profile without skills', async () => {
    repository.findSkillsByProfileIds.mockResolvedValue([]);

    await expect(loaders.skillsByProfileId.load('missing')).resolves.toEqual([]);
  });

  it('groups achievements by experience', async () => {
    repository.findAchievementsByExperienceIds.mockResolvedValue([
      { id: 'a1', experienceId: 'e1', text: 'First' },
      { id: 'a2', experienceId: 'e2', text: 'Second' },
      { id: 'a3', experienceId: 'e1', text: 'Third' },
    ]);

    const [first, second] = await Promise.all([
      loaders.achievementsByExperienceId.load('e1'),
      loaders.achievementsByExperienceId.load('e2'),
    ]);

    expect(first.map((item) => item.text)).toEqual(['First', 'Third']);
    expect(second.map((item) => item.text)).toEqual(['Second']);
  });
});
