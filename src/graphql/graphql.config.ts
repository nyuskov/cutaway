import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriverConfig } from '@nestjs/apollo';
import depthLimit from 'graphql-depth-limit';

/**
 * Schema depth is intentionally small today. The limit is a guard for future
 * growth: it rejects pathological documents before execution.
 */
export const MAX_QUERY_DEPTH = 15;

/** Pre-filled in Sandbox so the card can be read without writing a query. */
export const PROFILE_CARD_DOCUMENT = `query MyCard {
  profile {
    name
    headline
    description
    location
    email
    contacts { label url }
    skills { name category level }
    experience {
      company
      position
      startDate
      endDate
      location
      achievements { text }
    }
    projects { name description url tags }
  }
}`;

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
        ? ApolloServerPluginLandingPageLocalDefault({
            embed: { runTelemetry: false },
            document: PROFILE_CARD_DOCUMENT,
          })
        : ApolloServerPluginLandingPageDisabled(),
    ],
  };
}
