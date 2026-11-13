# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY prisma ./prisma
COPY prisma.config.ts nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate && npm run build

FROM deps AS test
COPY prisma ./prisma
COPY prisma.config.ts nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY test ./test
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate
CMD ["npm", "run", "test:cov"]

FROM node:24-alpine AS runtime
ENV NODE_ENV=production \
    CHECKPOINT_DISABLE=1
WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json package-lock.json ./
# `prisma` stays in production dependencies: the container migrates itself on start.
RUN npm ci --omit=dev && npm cache clean --force

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY docker ./docker
COPY --from=build /app/dist ./dist

RUN chmod +x docker/entrypoint.sh && chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/health >/dev/null || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "docker/entrypoint.sh"]
