import { NotFoundException } from '@nestjs/common';
import type {
  ProfileModel as Profile,
  ProjectModel as Project,
} from '../../src/generated/prisma/models';
import { ProfileRepository } from '../../src/profile/profile.repository';
import { ProfileService } from '../../src/profile/profile.service';

type RepositoryMock = {
  findPrimary: jest.Mock;
  findMany: jest.Mock;
  findProjectBySlug: jest.Mock;
};

describe('ProfileService', () => {
  let repository: RepositoryMock;
  let service: ProfileService;

  const profile = {
    id: 'profile-1',
    slug: 'nikita-yuskov',
  } as unknown as Profile;

  beforeEach(() => {
    repository = {
      findPrimary: jest.fn(),
      findMany: jest.fn(),
      findProjectBySlug: jest.fn(),
    };
    service = new ProfileService(repository as unknown as ProfileRepository);
  });

  it('returns the primary profile', async () => {
    repository.findPrimary.mockResolvedValue(profile);

    await expect(service.getPrimaryProfile()).resolves.toBe(profile);
  });

  it('fails with a clear message when the database has no profile', async () => {
    repository.findPrimary.mockResolvedValue(null);

    await expect(service.getPrimaryProfile()).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.getPrimaryProfile()).rejects.toThrow(/npm run db:setup/);
  });

  it('lists all profiles in repository order', async () => {
    const profiles = [profile];
    repository.findMany.mockResolvedValue(profiles);

    await expect(service.listProfiles()).resolves.toBe(profiles);
  });

  it('returns null for an unknown project', async () => {
    repository.findProjectBySlug.mockResolvedValue(null);

    await expect(service.getProject('unknown')).resolves.toBeNull();
    expect(repository.findProjectBySlug).toHaveBeenCalledWith('unknown');
  });

  it('returns a project by slug', async () => {
    const project = { id: 'project-1', slug: 'cutaway' } as unknown as Project;
    repository.findProjectBySlug.mockResolvedValue(project);

    await expect(service.getProject('cutaway')).resolves.toBe(project);
  });
});
