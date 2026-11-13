import { Args, Query, Resolver } from '@nestjs/graphql';
import type { ProjectModel as Project } from '../generated/prisma/models';
import { ProjectModel } from './models/project.model';
import { ProfileService } from './profile.service';

@Resolver(() => ProjectModel)
export class ProjectResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProjectModel, {
    name: 'project',
    nullable: true,
    description: 'Проект по короткому идентификатору',
  })
  project(@Args('slug', { type: () => String }) slug: string): Promise<Project | null> {
    return this.profileService.getProject(slug);
  }
}
