import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ContactKind } from '../../generated/prisma/enums';

registerEnumType(ContactKind, {
  name: 'ContactKind',
  description: 'Тип профессиональной ссылки',
  valuesMap: {
    GITHUB: { description: 'Профиль GitHub' },
    LINKEDIN: { description: 'Профиль LinkedIn' },
    HH: { description: 'Резюме на hh.ru' },
    TELEGRAM: { description: 'Telegram' },
    EMAIL: { description: 'Электронная почта' },
    WEBSITE: { description: 'Личный сайт или портфолио' },
  },
});

@ObjectType('Contact', { description: 'Ссылка на профессиональный ресурс' })
export class ContactModel {
  @Field(() => ID)
  id: string;

  @Field(() => ContactKind)
  kind: ContactKind;

  @Field({ description: 'Подпись для интерфейса, например «GitHub»' })
  label: string;

  @Field({ description: 'Абсолютный URL или mailto:' })
  url: string;
}
