import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import type { ProfileModel as Profile } from '../generated/prisma/models';
import { GraphQLContext } from '../graphql/graphql.context';
import { ContactModel } from './models/contact.model';
import { ExperienceModel } from './models/experience.model';
import { ProfileModel } from './models/profile.model';
import { ProjectModel } from './models/project.model';
import { SkillModel } from './models/skill.model';
import { ProfileService } from './profile.service';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProfileModel, {
    name: 'profile',
    description: 'Основная визитка: профиль и все связанные данные',
  })
  profile(): Promise<Profile> {
    return this.profileService.getPrimaryProfile();
  }

  @Query(() => [ProfileModel], {
    name: 'profiles',
    description: 'Все визитки. Связи загружаются пакетно, без N+1',
  })
  profiles(): Promise<Profile[]> {
    return this.profileService.listProfiles();
  }

  @ResolveField('contacts', () => [ContactModel])
  contacts(@Parent() profile: Profile, @Context() context: GraphQLContext) {
    return context.loaders.contactsByProfileId.load(profile.id);
  }

  @ResolveField('skills', () => [SkillModel])
  skills(@Parent() profile: Profile, @Context() context: GraphQLContext) {
    return context.loaders.skillsByProfileId.load(profile.id);
  }

  @ResolveField('experience', () => [ExperienceModel])
  experience(@Parent() profile: Profile, @Context() context: GraphQLContext) {
    return context.loaders.experienceByProfileId.load(profile.id);
  }

  @ResolveField('projects', () => [ProjectModel])
  projects(@Parent() profile: Profile, @Context() context: GraphQLContext) {
    return context.loaders.projectsByProfileId.load(profile.id);
  }
}
