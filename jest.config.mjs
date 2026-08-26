import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.test.(ts|tsx)'],
  // NOTE: next/jest's babel/SWC preset rewrites tsconfig '@/*' aliases to
  // RELATIVE paths (e.g. '../../app/lib/prisma') BEFORE Jest resolves modules.
  // Mapping only the literal alias therefore never matches. Map every resolved
  // spelling of app/lib/prisma to the shared mock instead.
  moduleNameMapper: {
    '^@/app/lib/prisma$': '<rootDir>/__tests__/mocks/prisma.ts',
    '^.*/app/lib/prisma(\\.js)?$': '<rootDir>/__tests__/mocks/prisma.ts',
  },
};

export default createJestConfig(config);
