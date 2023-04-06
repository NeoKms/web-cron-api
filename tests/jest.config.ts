import type { Config } from 'jest';

const config: Config = {
  rootDir: '../',
  testRegex: '.*\\.spec\\.ts$',
  testEnvironment: 'node',
  verbose: true,
  bail: 2,
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!**/helpers/**',
    '!**/migrations/**',
    '!**/config/**',
    '!src/main.ts',
  ],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};

export default config;
