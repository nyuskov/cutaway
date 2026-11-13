import { execFileSync } from 'node:child_process';

export default function globalSetup(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run e2e tests');
  }

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: __dirname + '/..',
    env: process.env,
    stdio: 'inherit',
  });
}
