import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Global Prisma mock.
// NOTE: moduleNameMapper cannot intercept '@/app/lib/prisma' because next/jest's
// babel preset rewrites tsconfig '@/*' aliases to relative paths BEFORE jest
// resolution. A global jest.mock here (hoisted above all imports) is reliable:
// babel rewrites the alias in this string identically to the test imports, so
// both resolve to the same module id and every test gets this mock instance.
const mockPrisma = {
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $transaction: jest.fn(async (ops: unknown) => {
    if (Array.isArray(ops)) return Promise.all(ops as Promise<unknown>[]);
    if (typeof ops === 'function') return (ops as (c: unknown) => unknown)(mockPrisma);
    return undefined;
  }),
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  listing: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};
jest.mock('@/app/lib/prisma', () => ({
  __esModule: true,
  prisma: mockPrisma,
  default: mockPrisma,
}));

// jsdom polyfills
if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}

// jsdom lacks matchMedia, needed by framer-motion (skip under node environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
