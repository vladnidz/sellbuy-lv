/**
 * Unit tests for GET /api/categories/tree
 * Prisma is mocked via moduleNameMapper -> __tests__/mocks/prisma.ts
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { GET } from '@/app/api/categories/tree/route';

jest.mock('@/app/lib/prisma', () => {
  const original = jest.requireActual('__tests__/mocks/prisma');
  return original;
});

function rows() {
  return [
    {
      id: 'cat-1',
      name: 'Electronics',
      nameLv: 'Elektronika',
      nameRu: 'Электроника',
      nameEn: 'Electronics',
      attributes: null,
      path: 'elektronika',
      parentId: null,
    },
    {
      id: 'cat-2',
      name: 'Phones',
      nameLv: 'Telefoni',
      nameRu: 'Телефоны',
      nameEn: 'Phones',
      attributes: { brand: 'string' },
      path: 'elektronika.telefoni',
      parentId: 'cat-1',
    },
  ];
}

describe('GET /api/categories/tree', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a nested tree with localized names and children', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue(rows());

    const req = new NextRequest('http://localhost/api/categories/tree');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(2);
    expect(body.data).toHaveLength(1); // single root

    const root = body.data[0];
    expect(root).toMatchObject({
      id: 'cat-1',
      names: { lv: 'Elektronika', ru: 'Электроника', en: 'Electronics' },
    });
    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toMatchObject({
      id: 'cat-2',
      names: { lv: 'Telefoni', ru: 'Телефоны', en: 'Phones' },
      attributes: { brand: 'string' },
    });
  });

  it('falls back to the base name when a translation is missing', async () => {
    const partial = [
      {
        id: 'c1',
        name: 'Sports',
        nameLv: null,
        nameRu: null,
        nameEn: null,
        attributes: null,
        path: 'sports',
        parentId: null,
      },
    ];
    (prisma.$queryRaw as jest.Mock).mockResolvedValue(partial);

    const res = await GET(new NextRequest('http://localhost/api/categories/tree'));
    const body = await res.json();

    expect(body.data[0].names).toEqual({ lv: 'Sports', ru: 'Sports', en: 'Sports' });
  });

  it('returns multiple roots when several categories have no parent', async () => {
    const many = [
      { id: 'a', name: 'A', nameLv: null, nameRu: null, nameEn: null, attributes: null, path: 'a', parentId: null },
      { id: 'b', name: 'B', nameLv: null, nameRu: null, nameEn: null, attributes: null, path: 'b', parentId: null },
    ];
    (prisma.$queryRaw as jest.Mock).mockResolvedValue(many);

    const res = await GET(new NextRequest('http://localhost/api/categories/tree'));
    const body = await res.json();

    expect(body.data.map((n: { id: string }) => n.id)).toEqual(['a', 'b']);
  });

  it('returns 500 when the query fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('db down'));

    const res = await GET(new NextRequest('http://localhost/api/categories/tree'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to fetch category tree' });
    spy.mockRestore();
  });
});
