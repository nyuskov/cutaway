import { ContactKind, SkillLevel } from '../generated/prisma/enums';

export interface SeedContact {
  kind: ContactKind;
  label: string;
  url: string;
}

export interface SeedSkill {
  name: string;
  category: string;
  level: SkillLevel;
}

export interface SeedExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate: Date | null;
  location?: string;
  summary?: string;
  achievements: string[];
}

export interface SeedProject {
  slug: string;
  name: string;
  description?: string;
  url: string;
  repositoryUrl?: string;
  startedAt?: Date;
  tags: string[];
}

export interface SeedProfile {
  slug: string;
  name: string;
  headline: string;
  description: string;
  location?: string;
  email?: string;
  avatarUrl?: string;
  isPrimary: boolean;
  contacts: SeedContact[];
  skills: SeedSkill[];
  experience: SeedExperience[];
  projects: SeedProject[];
}

/** Builds a UTC date for the first day of a `YYYY-MM` month. */
function month(value: string): Date {
  const [year, monthNumber] = value.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1));
}

export const profileSeed: SeedProfile = {
  slug: 'nikita-yuskov',
  name: 'Никита Юсков',
  headline: 'Senior backend-разработчик · Python / TypeScript',
  description:
    'Почти 9 лет проектирую и развиваю backend-системы: от PAM-платформы в «Солар» до внутренних сервисов на Django и FastAPI. Отвечаю за архитектуру данных, надёжность и сопровождаемость кода, умею работать на стыке backend и frontend. Ценю простые решения, которые выдерживают рост продукта и остаются понятными команде.',
  location: 'Москва',
  email: 'nyuskov@gmail.com',
  avatarUrl: 'https://avatars.githubusercontent.com/u/86071074?v=4',
  isPrimary: true,
  contacts: [
    { kind: ContactKind.GITHUB, label: 'GitHub', url: 'https://github.com/nyuskov' },
    {
      kind: ContactKind.HH,
      label: 'Резюме на hh.ru',
      url: 'https://hh.ru/resume/4a194900ff01f0e7710039ed1f6b356d474d46',
    },
    { kind: ContactKind.TELEGRAM, label: 'Telegram', url: 'https://t.me/nyuskov' },
    { kind: ContactKind.EMAIL, label: 'Email', url: 'mailto:nyuskov@gmail.com' },
  ],
  skills: [
    { name: 'TypeScript', category: 'Языки', level: SkillLevel.ADVANCED },
    { name: 'Python', category: 'Языки', level: SkillLevel.EXPERT },
    { name: 'JavaScript', category: 'Языки', level: SkillLevel.ADVANCED },
    { name: 'Go', category: 'Языки', level: SkillLevel.INTERMEDIATE },
    { name: 'SQL', category: 'Языки', level: SkillLevel.ADVANCED },
    { name: 'NestJS', category: 'Backend', level: SkillLevel.ADVANCED },
    { name: 'Django', category: 'Backend', level: SkillLevel.EXPERT },
    { name: 'FastAPI', category: 'Backend', level: SkillLevel.ADVANCED },
    { name: 'DRF', category: 'Backend', level: SkillLevel.ADVANCED },
    { name: 'SQLAlchemy', category: 'Backend', level: SkillLevel.ADVANCED },
    { name: 'Alembic', category: 'Backend', level: SkillLevel.ADVANCED },
    { name: 'Celery', category: 'Backend', level: SkillLevel.INTERMEDIATE },
    { name: 'PostgreSQL', category: 'Данные', level: SkillLevel.ADVANCED },
    { name: 'MySQL', category: 'Данные', level: SkillLevel.INTERMEDIATE },
    { name: 'Redis', category: 'Данные', level: SkillLevel.INTERMEDIATE },
    { name: 'SQLite', category: 'Данные', level: SkillLevel.INTERMEDIATE },
    { name: 'Vue 3', category: 'Frontend', level: SkillLevel.ADVANCED },
    { name: 'React', category: 'Frontend', level: SkillLevel.INTERMEDIATE },
    { name: 'HTML/CSS', category: 'Frontend', level: SkillLevel.ADVANCED },
    { name: 'Docker', category: 'Инфраструктура', level: SkillLevel.ADVANCED },
    { name: 'Ansible', category: 'Инфраструктура', level: SkillLevel.INTERMEDIATE },
    { name: 'Jenkins', category: 'Инфраструктура', level: SkillLevel.INTERMEDIATE },
    { name: 'Git', category: 'Инфраструктура', level: SkillLevel.ADVANCED },
    { name: 'Playwright', category: 'Инфраструктура', level: SkillLevel.INTERMEDIATE },
    { name: 'GraphQL', category: 'API и качество', level: SkillLevel.INTERMEDIATE },
    { name: 'REST', category: 'API и качество', level: SkillLevel.ADVANCED },
    { name: 'Prisma', category: 'API и качество', level: SkillLevel.INTERMEDIATE },
  ],
  experience: [
    {
      company: 'Рабочие Руки',
      position: 'Старший разработчик',
      startDate: month('2025-11'),
      endDate: month('2026-06'),
      summary: 'Внутренние проекты компании: сервисы на Python и Vue, интеграции и автоматизация.',
      achievements: [
        'Разрабатывал и поддерживал внутренние сервисы на Python 3 и Vue.js.',
        'Проектировал REST API на DRF со спецификацией Swagger.',
        'Автоматизировал критические сценарии на Playwright и Celery.',
      ],
    },
    {
      company: 'Проекты под NDA',
      position: 'Ведущий разработчик',
      startDate: month('2022-10'),
      endDate: month('2025-11'),
      summary:
        'Проекты различной сложности: API, фронтенд и ответственность за архитектурные решения.',
      achievements: [
        'Разрабатывал проекты различной сложности на Django и FastAPI.',
        'Проектировал слой данных на SQLAlchemy и Alembic, сопровождал миграции.',
        'Выводил отдельные сервисы на Go и Vue, интегрируя их с существующей платформой.',
      ],
    },
    {
      company: 'НТБ (Солар)',
      position: 'Ведущий разработчик',
      startDate: month('2018-10'),
      endDate: month('2022-10'),
      summary: 'Система привилегированного доступа и поддержка PAM-платформы.',
      achievements: [
        'Спроектировал структуру БД системы привилегированного доступа.',
        'Реализовал протоколы telnet и ssh, заложил API продукта.',
        'Написал скрипты сборки и развёртывания приложения на Ansible.',
        'Ускорил страницы PAM-системы, добавил видео- и файловый менеджер, резервирование.',
      ],
    },
    {
      company: 'Тензор',
      position: 'Программист Python',
      startDate: month('2018-05'),
      endDate: month('2018-08'),
      location: 'Ярославль',
      summary: 'Нагрузочное тестирование продуктов компании.',
      achievements: [
        'Спроектировал и разработал фреймворк для нагрузочного тестирования.',
        'Проводил нагрузочные тесты продуктов на Locust и Jenkins.',
      ],
    },
    {
      company: 'Лабмедиа',
      position: 'Программист JS (middle)',
      startDate: month('2018-01'),
      endDate: month('2018-05'),
      location: 'Ярославль',
      summary: 'Порталы обучения персонала и корпоративные интернет-ресурсы.',
      achievements: [
        'Разрабатывал порталы обучения для Эльдорадо, Макдональдс и других клиентов.',
        'Реализовал анимации интерфейсов по дизайну: кнопки, поиск, ссылки.',
      ],
    },
    {
      company: 'Ивановский государственный университет',
      position: 'Web-разработчик',
      startDate: month('2016-03'),
      endDate: month('2016-06'),
      location: 'Иваново',
      summary: 'Сайт международной научной конференции.',
      achievements: ['Разработал главную страницу конференции и страницы участников.'],
    },
    {
      company: 'ЗаборМос',
      position: 'Web-разработчик',
      startDate: month('2016-01'),
      endDate: month('2016-03'),
      location: 'Москва',
      summary: 'Сайт компании под ключ: проектирование, разработка и продвижение.',
      achievements: ['Разработал сайт компании и настроил контекстную рекламу в Яндекс.Директе.'],
    },
  ],
  projects: [
    {
      slug: 'cutaway',
      name: 'cutaway',
      description:
        'Цифровая визитка: GraphQL API на NestJS, Prisma и PostgreSQL, Apollo Sandbox и Docker.',
      url: 'https://github.com/nyuskov/cutaway',
      tags: ['NestJS', 'GraphQL', 'Prisma', 'PostgreSQL', 'Docker'],
    },
    {
      slug: 'calendar',
      name: 'calendar',
      description:
        'График смен сотрудников: недельный и месячный вид, шаблоны смен, поиск и покрытие.',
      url: 'https://github.com/nyuskov/calendar',
      tags: ['Vue 3', 'Laravel', 'PostgreSQL', 'Docker'],
    },
    {
      slug: 'paysystem',
      name: 'paysystem',
      description:
        'Платёжная система: FastAPI-бэкенд и Nuxt-фронтенд, деплой через Docker Compose.',
      url: 'https://github.com/nyuskov/paysystem',
      tags: ['FastAPI', 'Nuxt', 'PostgreSQL', 'Docker'],
    },
    {
      slug: 'microshop',
      name: 'microshop',
      description: 'Мессенджер Pismo: TypeScript-сервисы, очереди RabbitMQ, метрики Prometheus.',
      url: 'https://github.com/nyuskov/microshop',
      tags: ['TypeScript', 'RabbitMQ', 'Prometheus', 'Docker'],
    },
    {
      slug: 'shop',
      name: 'shop',
      description: 'Небольшой интернет-магазин на Python: каталог, корзина и оформление заказа.',
      url: 'https://github.com/nyuskov/shop',
      tags: ['Python'],
    },
    {
      slug: 'django-apps',
      name: 'django',
      description: 'Набор прикладных приложений на Django.',
      url: 'https://github.com/nyuskov/django',
      tags: ['Python', 'Django'],
    },
    {
      slug: 'datepicker',
      name: 'datepicker',
      description: 'Лёгкий компонент выбора даты для Vue 3.',
      url: 'https://github.com/nyuskov/datepicker',
      tags: ['Vue 3'],
    },
  ],
};
