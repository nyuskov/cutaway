import { ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaModule } from './database/prisma.module';
import { GraphQLContext } from './graphql/graphql.context';
import { buildApolloOptions, resolveGraphQLSecurity } from './graphql/graphql.config';
import { SandboxApolloDriver } from './graphql/sandbox-apollo.driver';
import { HealthModule } from './health/health.module';
import { ProfileLoaders } from './profile/profile.loaders';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: SandboxApolloDriver,
      imports: [ProfileModule],
      inject: [ProfileLoaders],
      useFactory: (loaders: ProfileLoaders) => ({
        ...buildApolloOptions(resolveGraphQLSecurity()),
        // Loaders live for exactly one GraphQL request, so batches never leak
        // between users and the cache stays request-scoped.
        context: (): GraphQLContext => ({ loaders: loaders.create() }),
      }),
    }),
    ProfileModule,
    HealthModule,
  ],
})
export class AppModule {}
