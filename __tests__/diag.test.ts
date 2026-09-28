/**
 * @jest-environment node
 */
import { prisma } from '@/app/lib/prisma';

describe('diag', () => {
  it('shows what prisma resolves to', () => {
    const p = prisma as unknown as Record<string, unknown>;
    console.log('keys:', Object.keys(prisma));
    console.log('user keys:', Object.keys(p.user as Record<string, unknown>));
    console.log('user.create:', (p.user as Record<string, unknown>).create);
    console.log('$queryRaw type:', typeof prisma.$queryRaw);
    try {
      const anyPrisma = p;
      console.log('isSpy?', typeof (anyPrisma.$queryRaw as { mock?: unknown }).mock !== 'undefined');
      console.log('getQueryMock?', typeof (anyPrisma.$queryRaw as { getMockName?: unknown }).getMockName === 'function');
    } catch (e) {
      console.log('err', String(e));
    }
    expect(true).toBe(true);
  });
});
