import { buildApolloOptions, resolveGraphQLSecurity } from '../../src/graphql/graphql.config';

describe('GraphQL security settings', () => {
  it('keeps Sandbox and introspection enabled by default', () => {
    expect(resolveGraphQLSecurity({})).toEqual({
      introspection: true,
      sandbox: true,
    });
  });

  it('disables both when introspection is turned off', () => {
    const security = resolveGraphQLSecurity({ GRAPHQL_INTROSPECTION: 'false' });

    expect(security).toEqual({ introspection: false, sandbox: false });
    expect(buildApolloOptions(security).introspection).toBe(false);
  });

  it('allows hiding only the Sandbox page', () => {
    const security = resolveGraphQLSecurity({ GRAPHQL_SANDBOX: 'false' });

    expect(security).toEqual({ introspection: true, sandbox: false });
  });
});
