import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { HelmetOptions } from 'helmet';

const ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS'];

export function resolveCorsOptions(env: NodeJS.ProcessEnv = process.env): CorsOptions {
  const configured = env.CORS_ORIGINS?.trim();

  if (!configured || configured === '*') {
    return { origin: true, methods: ALLOWED_METHODS };
  }

  return {
    origin: configured
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    methods: ALLOWED_METHODS,
  };
}

/**
 * Apollo Sandbox is served from Apollo's CDN and needs a few extra sources.
 * Everything else stays locked to the application origin.
 */
export function buildHelmetOptions(): HelmetOptions {
  return {
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          'https://embeddable-sandbox.cdn.apollographql.com',
        ],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': [
          "'self'",
          'data:',
          'https://apollo-server-landing-page.cdn.apollographql.com',
          'https://apollo-server-landing-pages.s3.amazonaws.com',
        ],
        'manifest-src': ["'self'", 'https://apollo-server-landing-page.cdn.apollographql.com'],
        'connect-src': [
          "'self'",
          'https://api.apollo.dev',
          'https://graphql.api.apollographql.com',
        ],
        'frame-src': ["'self'", 'https://sandbox.embed.apollographql.com'],
        'worker-src': ["'self'", 'blob:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  };
}
