/**
 * Unit tests for GET /api/categories (query: root, lang, withListingCount)
 * Prisma is mocked via moduleNameMapper -> __tests__/mocks/prisma.ts
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { GET } from '@/app/api/categories/route';

function rows(opts: { listingCount?: number } = {}) {
  const withParent = {
    id: 'cat-1',
    name: 'Elektronika',
    nameLv: 'Elektronika',
    nameRu: 'Электроника',
    nameEn: 'Electronics',
    attributes: null,
    path: 'elektronika',
    parentId: null,
    listingCount: opts.listingCount,
  };
  const child = {
    id: 'cat-2',
    name: 'Telefoni',
    nameLv: 'Telefoni',
    nameRu: 'Телефоны',
    nameEn: 'Phones',
    attributes: { brand: 'string' },
    path: 'elektronika.telefoni',
    parentId: 'cat-1',
    listingCount: opts.listingCount,
  };
  return [withParent, child];
}

function call(query = '') {
  const req = new NextRequest(`http://localhost/api/categories${query}`);
  return GET(req);
}

describe('GET /api/categories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects an invalid lang with 400', async () => {
    const res = await call('?lang=de');
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/invalid lang/i);
  });

  it('returns all categories by default', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue(rows());
    const res = await call();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(2);
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toMatchObject({
      id: 'cat-1',
      names: { lv: 'Elektronika', ru: 'Электроника', en: 'Electronics' },
      listingCount: undefined,
    });
  });

  it('root=true only returns top-level categories', async () => {
    // Simulate the DB filtering to a single root when root=true
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([rows()[0]]);
    const res = await call('?root=true');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(1);
    expect(body.data[0].parentId).toBeNull();
    // ltree root filter must be present in the generated SQL
    const sql = String((prisma.$queryRaw as jest.Mock).mock.calls[0][0]);
    expect(sql).toMatch(/root|!\s*~/i);
  });

  it('withListingCount increments listing counts', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue(
      rows({ listingCount: 5 })
    );
    const res = await call('?withListingCount=true');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data.every((c: { listingCount?: number }) => c.listingCount === 5)).toBe(true);
  });

  it('lang projects names to a single language', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue(rows());
    const res = await call('?lang=ru');
    const body = await res.json();

    expect(res.status).toBe(200);
    // When lang is set the payload collapses to { id, name, ... }
    expect(body.data[0]).toMatchObject({
      id: 'cat-1',
      name: 'Электроника',
    });
    expect(body.data[0]).not.toHaveProperty('names');
  });
});
