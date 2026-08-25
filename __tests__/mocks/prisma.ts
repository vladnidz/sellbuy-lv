console.error('>>> MOCK FILE EXECUTED <<<');
/**
 * Shared Prisma mock for unit tests.
 * Mapped over '@/app/lib/prisma' via jest.config.mjs moduleNameMapper.
 * Covers every prisma.<model>.<method> call used by app/ route handlers
 * and lib helpers so each is a jest.Mock in tests.
 */

export const prisma = {
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $transaction: jest.fn(async (ops: unknown) => {
    if (Array.isArray(ops)) return Promise.all(ops);
    if (typeof ops === 'function') return ops(prisma);
    return undefined;
  }),
  category: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
  },
  listing: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
};

export default prisma;
