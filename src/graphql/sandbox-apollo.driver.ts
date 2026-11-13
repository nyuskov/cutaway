import type { ApolloServerPlugin } from '@apollo/server';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ModulesContainer } from '@nestjs/core';

type LandingPageCapablePlugin = ApolloServerPlugin & {
  renderLandingPage?: () => unknown;
};

/**
 * `@nestjs/apollo` always appends its own landing-page plugin. This card ships
 * its own choice (Apollo Sandbox or a disabled page), so the first explicit
 * plugin wins and the framework default is dropped.
 */
export class SandboxApolloDriver extends ApolloDriver {
  constructor(modulesContainer: ModulesContainer) {
    super(modulesContainer);
  }

  override async mergeDefaultOptions(options: ApolloDriverConfig): Promise<ApolloDriverConfig> {
    const merged = await super.mergeDefaultOptions({ ...options, playground: false });
    let landingPageTaken = false;

    merged.plugins = (merged.plugins ?? []).filter((plugin) => {
      const rendersLandingPage =
        typeof (plugin as LandingPageCapablePlugin).renderLandingPage === 'function';

      if (!rendersLandingPage) {
        return true;
      }

      if (landingPageTaken) {
        return false;
      }

      landingPageTaken = true;
      return true;
    });

    return merged;
  }
}
