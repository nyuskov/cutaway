import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SkillLevel } from '../../generated/prisma/enums';

registerEnumType(SkillLevel, {
  name: 'SkillLevel',
  description: 'Уровень владения навыком',
});

@ObjectType('Skill', { description: 'Навык и уровень владения им' })
export class SkillModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ description: 'Группа навыков, например «Backend» или «Данные»' })
  category: string;

  @Field(() => SkillLevel)
  level: SkillLevel;
}
