export const prisma = {
  category: {
    findMany: jest.fn(),
  },
  listing: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

export default prisma;
