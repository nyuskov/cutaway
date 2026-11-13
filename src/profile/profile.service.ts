import { Injectable, NotFoundException } from '@nestjs/common';
import type { ProfileModel as Profile, ProjectModel as Project } from '../generated/prisma/models';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async getPrimaryProfile(): Promise<Profile> {
    const profile = await this.repository.findPrimary();

    if (!profile) {
      throw new NotFoundException('Профиль не найден. Примените миграции и сид: npm run db:setup');
    }

    return profile;
  }

  listProfiles(): Promise<Profile[]> {
    return this.repository.findMany();
  }

  getProject(slug: string): Promise<Project | null> {
    return this.repository.findProjectBySlug(slug);
  }
}
