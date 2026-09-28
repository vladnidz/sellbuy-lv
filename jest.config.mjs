import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.test.(ts|tsx)'],
  // NOTE: next/jest's babel/SWC preset rewrites tsconfig '@/*' aliases to
  // RELATIVE paths (e.g. '../../app/lib/prisma' or '../../lib/prisma') BEFORE Jest resolves modules.
  // Map all variations of lib/prisma to the shared mock.
  moduleNameMapper: {
    '^@/app/lib/prisma$': '<rootDir>/__tests__/mocks/prisma.ts',
    '^.*(/app)?/lib/prisma(\\.(js|ts))?$': '<rootDir>/__tests__/mocks/prisma.ts',
  },
};

export default createJestConfig(config);
