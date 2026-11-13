const path = require('path');

const rootDir = path.resolve(__dirname, '..');

/** @type {import('jest').Config} */
const shared = {
  rootDir,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: path.join(rootDir, 'tsconfig.json') }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: [path.join(rootDir, 'test/setup-env.ts')],
};

/** @type {import('jest').Config} */
module.exports = {
  rootDir,
  maxWorkers: 1,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/seed/run-seed.ts',
    '!src/**/*.module.ts',
    '!src/**/*.model.ts',
    '!src/generated/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/src/generated/', '/test/'],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 60,
      functions: 90,
      lines: 90,
    },
  },
  projects: [
    {
      ...shared,
      displayName: 'unit',
      testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
    },
    {
      ...shared,
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
      globalSetup: '<rootDir>/test/global-setup.ts',
    },
  ],
};
