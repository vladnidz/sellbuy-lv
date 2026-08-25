/**
 * Tests for the /listings page filtering + sorting + pagination logic.
 * Calls the page component directly (searchParams as Promise) and asserts
 * the Prisma queries it builds plus the pagination UI it renders.
 *
 * @jest-environment jsdom
 */
import { renderToStaticMarkup } from 'react-dom/server';
import ListingsPage from '@/app/listings/page';

jest.mock('@/app/lib/prisma', () => {
  const listing = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  return {
    prisma: {
      listing,
      category: { findMany: jest.fn(), findUnique: jest.fn() },
      $queryRaw: jest.fn(),
      $transaction: jest.fn(),
    },
  };
});

import { prisma } from '@/app/lib/prisma';

function makeListing(id: string, price = 10) {
  return {
    id,
    title: `Listing ${id}`,
    description: 'desc',
    price,
    images: [],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    category: { id: 'cat-1', name: 'Cat', parentId: null },
    author: { id: 'u1', name: 'User', email: 'u@example.com' },
  };
}

function setupMock(total: number) {
  (prisma.listing.findMany as jest.Mock).mockResolvedValue(
    Array.from({ length: Math.min(total, 12) }, (_, i) => makeListing(`l${i}`))
  );
  (prisma.listing.count as jest.Mock).mockResolvedValue(total);
  (prisma.category.findMany as jest.Mock).mockResolvedValue([
    { id: 'cat-1', name: 'Cat', path: 'cat', parentId: null },
  ]);
  (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ id: 'cat-1' }]);
}

async function renderPage(params: Record<string, string> = {}) {
  return ListingsPage({ searchParams: Promise.resolve(params) });
}

beforeEach(() => {
  jest.clearAllMocks();
  setupMock(30);
});

describe('/listings page query logic', () => {
  it('defaults: newest sort, page 1, limit 12, no filters', async () => {
    await renderPage();

    expect(prisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 12,
      })
    );
  });

  it('applies search term as insensitive OR across title/description', async () => {
    await renderPage({ q: 'velo' });

    const arg = (prisma.listing.findMany as jest.Mock).mock.calls[0][0];
    expect(arg.where.OR).toEqual([
      { title: { contains: 'velo', mode: 'insensitive' } },
      { description: { contains: 'velo', mode: 'insensitive' } },
    ]);
  });

  it('applies price range filters', async () => {
    await renderPage({ minPrice: '50', maxPrice: '100' });

    expect(prisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { price: { gte: 50, lte: 100 } },
      })
    );
  });

  it('maps sort values to orderBy', async () => {
    await renderPage({ sort: 'price_asc' });
    expect(prisma.listing.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ orderBy: { price: 'asc' } })
    );

    await renderPage({ sort: 'price_desc' });
    expect(prisma.listing.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ orderBy: { price: 'desc' } })
    );

    await renderPage({ sort: 'oldest' });
    expect(prisma.listing.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'asc' } })
    );
  });

  it('paginates: skip = (page-1)*limit', async () => {
    await renderPage({ page: '3' });

    expect(prisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 24, take: 12 })
    );
  });

  it('resolves category subtree via ltree $queryRaw and filters by ids', async () => {
    await renderPage({ category: 'cat-1' });

    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(prisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: { in: ['cat-1'] } },
      })
    );
  });

  it('falls back to impossible id when category matches nothing', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

    await renderPage({ category: 'ghost' });

    expect(prisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: { in: ['__no_match__'] } },
      })
    );
  });
});

describe('/listings page rendering', () => {
  it('renders listing titles and pagination info from mocked data', async () => {
    const element = await renderPage();
    const html = renderToStaticMarkup(<>{element}</>);

    expect(html).toContain('Listing l0');
    expect(html).toContain('30');
  });

  it('shows empty state when no listings match', async () => {
    (prisma.listing.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.listing.count as jest.Mock).mockResolvedValue(0);

    const element = await renderPage({ q: 'nothing-matches-this' });
    const html = renderToStaticMarkup(<>{element}</>);

    expect(html).not.toContain('Listing l0');
  });
});
