import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ContactModel } from './contact.model';
import { ExperienceModel } from './experience.model';
import { ProjectModel } from './project.model';
import { SkillModel } from './skill.model';

@ObjectType('Profile', { description: 'Цифровая визитка специалиста' })
export class ProfileModel {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Стабильный идентификатор визитки' })
  slug: string;

  @Field()
  name: string;

  @Field({ description: 'Короткий заголовок: роль и ключевые технологии' })
  headline: string;

  @Field({ description: 'Краткое описание специалиста' })
  description: string;

  @Field(() => String, { nullable: true })
  location: string | null;

  @Field(() => String, { nullable: true })
  email: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => [ContactModel])
  contacts: ContactModel[];

  @Field(() => [SkillModel])
  skills: SkillModel[];

  @Field(() => [ExperienceModel], { description: 'Опыт работы, от нового к старому' })
  experience: ExperienceModel[];

  @Field(() => [ProjectModel])
  projects: ProjectModel[];
}
