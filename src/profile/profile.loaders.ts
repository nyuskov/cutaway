import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import type {
  AchievementModel as Achievement,
  ContactModel as Contact,
  ExperienceModel as Experience,
  ProjectModel as Project,
  SkillModel as Skill,
} from '../generated/prisma/models';
import { ProfileRepository } from './profile.repository';

export interface ProfileLoadersMap {
  contactsByProfileId: DataLoader<string, Contact[]>;
  skillsByProfileId: DataLoader<string, Skill[]>;
  experienceByProfileId: DataLoader<string, Experience[]>;
  projectsByProfileId: DataLoader<string, Project[]>;
  achievementsByExperienceId: DataLoader<string, Achievement[]>;
}

/**
 * Builds a fresh set of DataLoaders for a single GraphQL request.
 * Every loader turns N relation lookups into one `WHERE ... IN (...)` query.
 */
@Injectable()
export class ProfileLoaders {
  constructor(private readonly repository: ProfileRepository) {}

  create(): ProfileLoadersMap {
    return {
      contactsByProfileId: new DataLoader((ids) =>
        this.group(
          ids,
          (keys) => this.repository.findContactsByProfileIds(keys),
          (row) => row.profileId,
        ),
      ),
      skillsByProfileId: new DataLoader((ids) =>
        this.group(
          ids,
          (keys) => this.repository.findSkillsByProfileIds(keys),
          (row) => row.profileId,
        ),
      ),
      experienceByProfileId: new DataLoader((ids) =>
        this.group(
          ids,
          (keys) => this.repository.findExperienceByProfileIds(keys),
          (row) => row.profileId,
        ),
      ),
      projectsByProfileId: new DataLoader((ids) =>
        this.group(
          ids,
          (keys) => this.repository.findProjectsByProfileIds(keys),
          (row) => row.profileId,
        ),
      ),
      achievementsByExperienceId: new DataLoader((ids) =>
        this.group(
          ids,
          (keys) => this.repository.findAchievementsByExperienceIds(keys),
          (row) => row.experienceId,
        ),
      ),
    };
  }

  private async group<T>(
    ids: readonly string[],
    load: (ids: string[]) => Promise<T[]>,
    keyOf: (row: T) => string,
  ): Promise<T[][]> {
    const rows = await load([...ids]);
    const grouped = new Map<string, T[]>(ids.map((id) => [id, []]));

    for (const row of rows) {
      grouped.get(keyOf(row))?.push(row);
    }

    return ids.map((id) => grouped.get(id) ?? []);
  }
}
