# cutaway — цифровая визитка

Backend-приложение, которое презентует специалиста: профиль, навыки, опыт работы,
проекты и профессиональные ссылки. Всё доступно через GraphQL и Apollo Sandbox.

**Живая версия:** https://pismo.alwaysdata.net/cutaway/graphql

## Стек

| Слой      | Технологии                                                     |
| --------- | -------------------------------------------------------------- |
| Язык      | TypeScript 5.9, Node.js 24                                     |
| Фреймворк | NestJS 11                                                      |
| API       | GraphQL (code-first), Apollo Server 5, Apollo Sandbox          |
| ORM / БД  | Prisma 7 (driver adapter `@prisma/adapter-pg`), PostgreSQL 16  |
| Тесты     | Jest 30 + ts-jest, 35 тестов, e2e на реальном PostgreSQL       |
| Запуск    | Docker Compose: `db` + `app`, отдельный профиль `test`         |
| Качество  | ESLint 10, Prettier, `npm audit`, скрипт проверки безопасности |

## Запуск

```bash
./deploy.sh
```

Скрипт собирает образы, поднимает PostgreSQL и приложение, ждёт готовности
healthcheck и показывает адреса. `Ctrl+C` останавливает контейнеры, данные БД
остаются в volume `cutaway_pgdata`.

| Что            | Адрес                                                |
| -------------- | ---------------------------------------------------- |
| Apollo Sandbox | http://localhost:3001/graphql                        |
| GraphQL API    | http://localhost:3001/graphql (POST)                 |
| Healthcheck    | http://localhost:3001/health                         |
| PostgreSQL     | `localhost:5434`, БД/пользователь/пароль — `cutaway` |

При каждом старте контейнер `app` выполняет `prisma migrate deploy` и идемпотентный
сид. Отдельно готовить базу не нужно.

Хостовые порты `3001` и `5434` выбраны, чтобы не конфликтовать с типовым локальным
PostgreSQL на `5432` и другими запущенными приложениями. Их можно поменять в
`docker-compose.yml` и `DATABASE_URL` в `.env`.

Вручную:

```bash
docker compose up -d --build
```

## GraphQL

Схема создаётся кодом (`autoSchemaFile`), поэтому модели, enum'ы и описания
полей живут рядом с резолверами и проверяются TypeScript.

```graphql
query Card {
  profile {
    name
    headline
    description
    location
    contacts {
      kind
      label
      url
    }
    skills {
      name
      category
      level
    }
    experience {
      company
      position
      startDate
      endDate
      achievements {
        text
      }
    }
    projects {
      slug
      name
      url
      tags
    }
  }
}
```

Дополнительные запросы:

```graphql
query Project($slug: String!) {
  project(slug: $slug) {
    name
    description
    repositoryUrl
  }
}

query AllCards {
  profiles {
    slug
    skills {
      name
    }
  }
}
```

| Тип           | Поля                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `Profile`     | `id`, `slug`, `name`, `headline`, `description`, `location`, `email`, `avatarUrl`, `contacts`, `skills`, `experience`, `projects` |
| `Contact`     | `id`, `kind`, `label`, `url`                                                                                                      |
| `Skill`       | `id`, `name`, `category`, `level`                                                                                                 |
| `Experience`  | `id`, `company`, `position`, `startDate`, `endDate`, `location`, `summary`, `achievements`                                        |
| `Achievement` | `id`, `text`                                                                                                                      |
| `Project`     | `id`, `slug`, `name`, `description`, `url`, `repositoryUrl`, `startedAt`, `tags`                                                  |

`Query`: `profile`, `profiles`, `project(slug)`. Мутаций нет: визитка — публичный
read-only ресурс, поэтому в приложении нет аутентификации и поверхности для записи.

## Архитектура

```
cutaway/
├── prisma/
│   ├── schema.prisma            # модель данных
│   └── migrations/              # SQL-миграции
├── src/
│   ├── main.ts                  # bootstrap
│   ├── app.setup.ts             # helmet, CORS, shutdown hooks
│   ├── app.module.ts            # сборка приложения и GraphQL-контекста
│   ├── database/                # PrismaService + PrismaModule
│   ├── graphql/
│   │   ├── graphql.config.ts    # опции Apollo, Sandbox, depth limit
│   │   └── sandbox-apollo.driver.ts
│   ├── health/                  # GET /health с проверкой БД
│   ├── http/security.ts         # CSP и CORS
│   ├── profile/
│   │   ├── models/              # GraphQL-типы (@ObjectType)
│   │   ├── profile.resolver.ts  # GraphQL-слой
│   │   ├── experience.resolver.ts
│   │   ├── project.resolver.ts
│   │   ├── profile.service.ts   # бизнес-правила
│   │   ├── profile.repository.ts# только запросы к Prisma
│   │   └── profile.loaders.ts   # DataLoader-ы на запрос
│   └── seed/                    # данные визитки и идемпотентный сид
├── test/
│   ├── unit/                    # быстрые тесты без БД
│   └── e2e/                     # GraphQL, сид и безопасность на PostgreSQL
├── docker/                      # entrypoint, init-скрипт тестовой БД
├── scripts/                     # test.sh, security.sh
├── deploy.sh / dev-local.sh
├── Dockerfile
└── docker-compose.yml
```

### Слои и ответственность

- **Резолверы** (`*.resolver.ts`) — только GraphQL: аргументы, выборки, `@ResolveField`.
  Никаких SQL-запросов и правил выбора профиля.
- **Сервис** (`profile.service.ts`) — бизнес-правила: какая визитка основная, что
  делать при пустой БД. Не знает о GraphQL.
- **Репозиторий** (`profile.repository.ts`) — единственное место, где приложение
  обращается к Prisma. Сортировки и `WHERE ... IN (...)` собраны здесь.
- **DataLoader-ы** (`profile.loaders.ts`) — инфраструктура GraphQL-слоя для
  пакетной загрузки связей; создаются на один HTTP-запрос.
- **Seed** (`src/seed`) — отдельный Nest-контекст, который можно запускать как
  CLI (`npm run db:seed`) и переиспользовать в тестах.

Модели Prisma и GraphQL-типы не дублируются в промежуточный DTO-слой: GraphQL
отдаёт только объявленные поля, поэтому служебные колонки (`isPrimary`,
`sortOrder`, `profileId`) в схему не попадают. Для read-only проекции это
упрощает код без потери контроля над контрактом.

### Вложенные данные без N+1

Каждая связь `Profile.contacts/skills/experience/projects` и
`Experience.achievements` разрешается через `DataLoader`, а не через отдельный
запрос на каждый элемент списка.

Запрос `profiles { skills { name } }` для любого числа профилей выполняет ровно
два SQL-запроса: один по `Profile`, один по `Skill` с `WHERE profileId IN (...)`.
Это проверяется e2e-тестом, который считает SQL через события Prisma.

Почему не `include` в одном запросе: `include` удобен для одного агрегата, но
при росте схемы и появлении списков он снова приводит к запросу на строку.
DataLoader даёт стабильное число запросов, дедуплицирует одинаковые ключи внутри
запроса и не разделяет кэш между пользователями — загрузчики живут один HTTP-запрос.

### Данные и инициализация

- `Profile` 1—N `Contact`, `Skill`, `Experience`, `Project`; `Experience` 1—N
  `Achievement`. Каскадное удаление настроено на уровне БД.
- Уникальные ограничения: `Profile.slug`, `Project.slug`, `(Profile, Skill.name)`,
  `(Profile, Contact.url)`. Индексы — по всем внешним ключам и `Experience.startDate`.
- `startDate`/`endDate` — `DATE`; открытый период — `endDate = null`.
- Миграции применяются контейнером при старте, сид идемпотентен: данные из
  `src/seed/seed.data.ts` — источник истины, замена выполняется в одной транзакции.
  Повторный запуск не создаёт дубликатов, а «лишние» профили удаляются.

Почему PostgreSQL: нужны реальные ограничения, enum'ы и массивы тегов, а также
предсказуемое поведение под конкурентной нагрузкой. Prisma 7 подключается через
драйвер `pg`, без Rust-движка; сгенерированный клиент лежит в `src/generated`
(gitignored) и собирается вместе с приложением.

### Docker

`Dockerfile` — multi-stage: `deps` → `build` → `test` / `runtime`. Runtime-образ
не содержит dev-зависимостей, работает от пользователя `node`, использует
`dumb-init` для корректной обработки сигналов и имеет healthcheck на `/health`.
`prisma` оставлен в production-зависимостях осознанно: контейнер сам применяет
миграции при старте.

`docker-compose.yml` содержит `db`, `app` и профиль `test` с отдельной базой
`cutaway_test`, чтобы e2e никогда не затрагивали данные визитки.

## Проверки

### Тесты — 36 тестов, покрытие 95%

```bash
./scripts/test.sh
```

Скрипт поднимает `db`, создаёт `cutaway_test`, собирает test-образ и запускает
unit + e2e с покрытием. HTML-отчёт: `coverage/lcov-report/index.html`.

| Набор | Тестов | Что проверяет                                                                                                                                                              |
| ----- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit  | 21     | бизнес-правила сервиса, пакетную загрузку, health, настройки GraphQL/CORS, целостность сида                                                                                |
| E2E   | 14     | вложенный GraphQL-запрос, сортировки, `project(slug)`, ошибка без профиля, идемпотентность сида, отсутствие N+1, заголовки безопасности, Sandbox, отсутствие мутаций, CORS |

Покрытие `src/` (без сгенерированного клиента и bootstrap-файлов):

| Statements | Branches | Functions | Lines  |
| ---------- | -------- | --------- | ------ |
| 95.28%     | 76.74%   | 93.58%    | 94.65% |

Локально без Docker и PostgreSQL можно запустить только unit:

```bash
npm ci
npm run test:unit
```

E2E требуют `DATABASE_URL` и применённых миграций — проще всего через
`./scripts/test.sh`.

### Сборка и стиль

```bash
npm run lint
npx prettier --check "src/**/*.ts" "test/**/*.ts"
npm run build
```

### Безопасность

```bash
./scripts/security.sh
```

Скрипт проверяет:

1. `npm audit --omit=dev --audit-level=high` — production-зависимости.
2. Секреты: `.env` не отслеживается git, в файлах нет приватных ключей и токенов.
3. Контейнер: приложение запускается не от root, healthcheck задан.
4. Security-тесты: заголовки, Sandbox, introspection, отсутствие мутаций, CORS.

Что включено в приложении:

- Helmet: CSP (разрешены только источники, нужные Apollo Sandbox), `nosniff`,
  `SAMEORIGIN`, `no-referrer`, COOP; заголовок `X-Powered-By` отключён.
- CORS с настраиваемым allow-list (`CORS_ORIGINS`), по умолчанию отражает origin.
- `GRAPHQL_INTROSPECTION=false` полностью отключает introspection и Sandbox.
- Ограничение глубины GraphQL-документа (15) — защита от патологических запросов.
- Read-only схема: нет мутаций, а значит нет неаутентифицированной записи.
- Секреты только через переменные окружения; `.env` в `.gitignore`, в репозитории
  лежит `.env.example`.
- Sandbox работает без телеметрии (`runTelemetry: false`).
- Транзитивный `@graphql-tools/utils` зафиксирован через `overrides` на исправленной
  версии; `npm audit` по production-зависимостям чист.

> Sandbox и introspection по умолчанию включены и в production: это публичная
> визитка, схема и есть продукт. Для закрытого контура достаточно выставить
> `GRAPHQL_INTROSPECTION=false`.

## Конфигурация

| Переменная              | По умолчанию | Назначение                                     |
| ----------------------- | ------------ | ---------------------------------------------- |
| `DATABASE_URL`          | —            | строка подключения PostgreSQL (обязательна)    |
| `PORT`                  | `3001`       | порт HTTP-сервера                              |
| `GRAPHQL_INTROSPECTION` | `true`       | introspection; `false` также отключает Sandbox |
| `GRAPHQL_SANDBOX`       | `true`       | страница Apollo Sandbox                        |
| `CORS_ORIGINS`          | `*`          | список origin'ов через запятую или `*`         |

## Запуск без контейнера приложения

```bash
./dev-local.sh
```

Скрипт поднимает только PostgreSQL в Docker, ставит зависимости, генерирует
Prisma Client, применяет миграции и сид, затем запускает `nest start --watch`.
База остаётся запущенной после `Ctrl+C`; остановить: `docker compose stop db`.

Вручную:

```bash
docker compose up -d --wait db
cp .env.example .env
npm ci
npm run db:setup
npm run start:dev
```

## Деплой на shared-хостинг (alwaysdata)

Текущий стенд: **https://pismo.alwaysdata.net/cutaway/graphql**. Он живёт
отдельным Node.js-сайтом по пути `/cutaway/`, поэтому основной сайт
`pismo.alwaysdata.net` (calendar) не затрагивается.

Приложение не требует Docker в runtime: сайт запускает `node dist/main.js`,
а PostgreSQL берётся у хостинга. Хостинг передаёт `PORT` и ожидает IPv6-сокет
`::`; приложение слушает `process.env.HOST ?? '::'`.

Сайт типа **Node.js** в панели:

| Параметр        | Значение                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Адрес           | `pismo.alwaysdata.net/cutaway/`                                                                                         |
| `path_trim`     | включён (приложение видит пути без `/cutaway`)                                                                          |
| Команда         | `node dist/main.js`                                                                                                     |
| Рабочий каталог | `cutaway`                                                                                                               |
| Node.js         | 24                                                                                                                      |
| Переменные      | `DATABASE_URL=...`, `NODE_ENV=production`, `GRAPHQL_INTROSPECTION=true`, `GRAPHQL_SANDBOX=true`, `CHECKPOINT_DISABLE=1` |

Повторный деплой (сборка и production-зависимости готовятся локально, потому
что на shared-хостинге срабатывает лимит памяти на `npm ci`):

```bash
ALWAYSDATA_REMOTE=pismo@ssh-pismo.alwaysdata.net ./scripts/deploy-alwaysdata.sh
```

Скрипт собирает `dist`, ставит production-зависимости во временный каталог,
загружает бандл по SSH и применяет миграции с сидом. На сервере в
`~/cutaway/.env` должен лежать `DATABASE_URL`; сам файл не коммитится.

## Ограничения и дальнейшие шаги

- Мутации и аутентификация не добавлены осознанно: визитка публичная и read-only.
- Для публичного хостинга перед приложением нужен TLS-терминатор (Caddy/Nginx);
  HSTS уже отдаётся Helmet.
- При росте нагрузки имеет смысл добавить rate limiting и кэширование ответов
  GraphQL; сейчас схема маленькая и предсказуемая.
