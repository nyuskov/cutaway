import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Achievement', { description: 'Измеримый результат на конкретном месте работы' })
export class AchievementModel {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Формулировка достижения' })
  text: string;
}
