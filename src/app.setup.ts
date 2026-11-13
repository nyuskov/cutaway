import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { buildHelmetOptions, resolveCorsOptions } from './http/security';

export function configureApp(app: INestApplication): void {
  const httpAdapter = app.getHttpAdapter().getInstance() as {
    disable?: (setting: string) => void;
  };
  httpAdapter.disable?.('x-powered-by');

  app.use(helmet(buildHelmetOptions()));
  app.enableCors(resolveCorsOptions());
  app.enableShutdownHooks();
}
