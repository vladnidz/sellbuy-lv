import { prisma } from '@/app/lib/prisma';

describe('mock resolution', () => {
  it('identity check', () => {
    const p = prisma as any;
    console.log('IMPORTED ctor name:', p.constructor?.name);
    console.log('IMPORTED keys:', Object.keys(p).slice(0, 8));
    const lm = p.listing?.findMany;
    console.log('listing.findMany typeof:', typeof lm);
    console.log('listing.findMany has mock prop:', lm && Object.prototype.hasOwnProperty.call(lm, 'mock'));
    expect(true).toBe(true);
  });
});
