import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriverConfig } from '@nestjs/apollo';
import depthLimit from 'graphql-depth-limit';

/**
 * Schema depth is intentionally small today. The limit is a guard for future
 * growth: it rejects pathological documents before execution.
 */
export const MAX_QUERY_DEPTH = 15;

export interface GraphQLSecurityOptions {
  introspection: boolean;
  sandbox: boolean;
}

export function resolveGraphQLSecurity(
  env: NodeJS.ProcessEnv = process.env,
): GraphQLSecurityOptions {
  const introspection = env.GRAPHQL_INTROSPECTION !== 'false';

  return {
    introspection,
    // Sandbox cannot discover the schema without introspection.
    sandbox: introspection && env.GRAPHQL_SANDBOX !== 'false',
  };
}

export function buildApolloOptions(
  security: GraphQLSecurityOptions,
): Omit<ApolloDriverConfig, 'driver'> {
  return {
    autoSchemaFile: true,
    sortSchema: true,
    introspection: security.introspection,
    validationRules: [depthLimit(MAX_QUERY_DEPTH)],
    plugins: [
      security.sandbox
        ? ApolloServerPluginLandingPageLocalDefault({ embed: { runTelemetry: false } })
        : ApolloServerPluginLandingPageDisabled(),
    ],
  };
}
