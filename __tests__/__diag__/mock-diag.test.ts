import { prisma } from '@/app/lib/prisma';

describe('mock resolution', () => {
  it('identity check', () => {
    const p = prisma as unknown;
    // Narrow to object after constructor check
    const mockPrisma = p as typeof prisma;
    console.log('IMPORTED ctor name:', mockPrisma.constructor?.name);
    console.log('IMPORTED keys:', Object.keys(mockPrisma).slice(0, 8));
    const lm = mockPrisma.listing?.findMany;
    console.log('listing.findMany typeof:', typeof lm);
    console.log('listing.findMany has mock prop:', lm && Object.prototype.hasOwnProperty.call(lm, 'mock'));
    expect(true).toBe(true);
  });
});
