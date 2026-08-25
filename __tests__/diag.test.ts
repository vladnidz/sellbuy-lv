/**
 * @jest-environment node
 */
import { prisma } from '@/app/lib/prisma';

describe('diag', () => {
  it('shows what prisma resolves to', () => {
    console.log('keys:', Object.keys(prisma));
    console.log('$queryRaw type:', typeof prisma.$queryRaw);
    try {
      // eslint-disable-next-line
      const anyPrisma = prisma as any;
      console.log('isSpy?', typeof anyPrisma.$queryRaw.mock !== 'undefined');
      console.log('getQueryMock?', typeof anyPrisma.$queryRaw.getMockName === 'function');
    } catch (e) {
      console.log('err', String(e));
    }
    expect(true).toBe(true);
  });
});
