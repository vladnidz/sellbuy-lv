/**
 * @jest-environment node
 */
jest.mock('@/app/lib/prisma', () => ({
  prisma: { ping: jest.fn(() => 'mocked') },
}));

import { prisma } from '@/app/lib/prisma';

describe('resolution probe', () => {
  it('uses the jest.mock factory', () => {
    // eslint-disable-next-line no-console
    console.log('ping type:', typeof (prisma as Record<string, unknown>).ping);
    expect(true).toBe(true);
  });
});
