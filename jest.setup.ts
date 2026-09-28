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
  $transaction: jest.fn(async (ops: unknown): Promise<unknown> => {
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
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  rating: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
};
jest.mock('@/app/lib/prisma', () => ({
  __esModule: true,
  prisma: mockPrisma,
  default: mockPrisma,
}));

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  useParams() {
    return {};
  },
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// jsdom polyfills
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

if (typeof global.ReadableStream === 'undefined') {
  try {
    const streamWeb = require('node:stream/web');
    global.ReadableStream = streamWeb.ReadableStream;
    global.TransformStream = streamWeb.TransformStream;
    global.WritableStream = streamWeb.WritableStream;
  } catch {}
}

// jsdom lacks Web API globals (Request, Response, Headers, fetch) needed by Next.js server routes
if (typeof global.Request === 'undefined' || typeof global.fetch === 'undefined') {
  const edgeFetch = require('next/dist/compiled/@edge-runtime/primitives/fetch');
  if (typeof global.Request === 'undefined') {
    global.Request = edgeFetch.Request;
  }
  if (typeof global.Response === 'undefined') {
    global.Response = edgeFetch.Response;
  }
  if (typeof global.Headers === 'undefined') {
    global.Headers = edgeFetch.Headers;
  }
  if (typeof global.fetch === 'undefined') {
    global.fetch = edgeFetch.fetch;
  }
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
