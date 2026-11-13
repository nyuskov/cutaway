import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Project', { description: 'Проект или открытый репозиторий' })
export class ProjectModel {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Короткий идентификатор для запроса project(slug:)' })
  slug: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field({ description: 'Ссылка на проект или репозиторий' })
  url: string;

  @Field(() => String, { nullable: true, description: 'Ссылка на исходный код, если отличается' })
  repositoryUrl: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  startedAt: Date | null;

  @Field(() => [String], { description: 'Ключевые технологии' })
  tags: string[];
}
