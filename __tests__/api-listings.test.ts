/**
 * Unit tests for GET /api/listings (?sort, ?category, ?page + pagination meta)
 * Prisma is mocked via moduleNameMapper -> __tests__/mocks/prisma.ts
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { GET } from '@/app/api/listings/route';

function listing(id: string) {
  return {
    id,
    title: `Listing ${id}`,
    price: 10,
    category: { id: 'cat-1', name: 'Cat' },
    author: { id: 'u1', name: 'User' },
  };
}

function setupMock(total: number) {
  (prisma.listing.findMany as jest.Mock).mockResolvedValue(
    Array.from({ length: Math.min(total, 20) }, (_, i) => listing(`l${i}`))
  );
  (prisma.listing.count as jest.Mock).mockResolvedValue(total);
}

function call(query = '') {
  const req = new NextRequest(`http://localhost/api/listings${query}`);
  return GET(req);
}

beforeEach(() => {
  jest.clearAllMocks();
  setupMock(45);
});

describe('GET /api/listings', () => {
  it('returns listings plus pagination meta', async () => {
    const res = await call();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body.listings)).toBe(true);
    expect(body.pagination).toEqual({ page: 1, limit: 20, total: 45, totalPages: 3 });
  });

  it('maps sort=price_asc / price_desc / oldest to orderBy', async () => {
    await call('?sort=price_asc');
    expect(prisma.listing.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ orderBy: { price: 'asc' } })
    );

    await call('?sort=price_desc');
    expect(prisma.listing.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ orderBy: { price: 'desc' } })
    );

    await call('?sort=oldest');
    expect(prisma.listing.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'asc' } })
    );

    await call('?sort=newest');
    expect(prisma.listing.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('filters by category using descendant category ids from ltree query', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ id: 'cat-1' }, { id: 'cat-9' }]);

    await call('?category=elektronika');

    // descendant lookup executed with the given ltree path
    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect((prisma.$queryRaw as jest.Mock).mock.calls[0][0].text).toContain('@>');

    expect(prisma.listing.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: { in: ['cat-1', 'cat-9'] },
        }),
      })
    );
  });

  it('uses a sentinel filter when no categories match', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

    await call('?category=nonexistent');

    expect(prisma.listing.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ categoryId: { in: ['__no_match__'] } }),
      })
    );
  });

  it('applies page/limit skip & take correctly', async () => {
    await call('?page=3&limit=10');

    expect(prisma.listing.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );

    const res = await call('?page=3&limit=10');
    const body = await res.json();
    expect(body.pagination).toEqual({ page: 3, limit: 10, total: 45, totalPages: 5 });
  });

  it('handles an empty result set', async () => {
    (prisma.listing.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.listing.count as jest.Mock).mockResolvedValue(0);

    const res = await call();
    const body = await res.json();

    expect(body.listings).toEqual([]);
    expect(body.pagination).toEqual({ page: 1, limit: 20, total: 0, totalPages: 0 });
  });

  it('returns 500 on database errors', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (prisma.listing.findMany as jest.Mock).mockRejectedValue(new Error('boom'));

    const res = await call();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch listings' });
    spy.mockRestore();
  });
});
