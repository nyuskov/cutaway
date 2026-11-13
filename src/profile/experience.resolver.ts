import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import type { ExperienceModel as Experience } from '../generated/prisma/models';
import { GraphQLContext } from '../graphql/graphql.context';
import { AchievementModel } from './models/achievement.model';
import { ExperienceModel } from './models/experience.model';

@Resolver(() => ExperienceModel)
export class ExperienceResolver {
  @ResolveField('achievements', () => [AchievementModel])
  achievements(@Parent() experience: Experience, @Context() context: GraphQLContext) {
    return context.loaders.achievementsByExperienceId.load(experience.id);
  }
}
