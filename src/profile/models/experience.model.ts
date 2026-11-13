import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { AchievementModel } from './achievement.model';

@ObjectType('Experience', { description: 'Место работы и достижения на нём' })
export class ExperienceModel {
  @Field(() => ID)
  id: string;

  @Field()
  company: string;

  @Field()
  position: string;

  @Field(() => GraphQLISODateTime, { description: 'Первый день работы (ISO 8601)' })
  startDate: Date;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Последний день работы; null — работа продолжается',
  })
  endDate: Date | null;

  @Field(() => String, { nullable: true })
  location: string | null;

  @Field(() => String, { nullable: true, description: 'Краткое описание роли' })
  summary: string | null;

  @Field(() => [AchievementModel], { description: 'Достижения, сгруппированные по месту работы' })
  achievements: AchievementModel[];
}
