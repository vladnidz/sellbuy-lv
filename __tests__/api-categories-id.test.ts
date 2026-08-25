/**
 * Unit tests for GET /api/categories/[id] (UUID + ltree path lookup)
 * Prisma is mocked via moduleNameMapper -> __tests__/mocks/prisma.ts
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { GET } from '@/app/api/categories/[id]/route';

const UUID = '11111111-2222-3333-4444-555555555555';
const LTREE_PATH = 'elektronika.telefoni';

function mainRow() {
  return {
    id: UUID,
    name: 'Phones',
    nameLv: 'Telefoni',
    nameRu: 'Телефоны',
    nameEn: 'Phones',
    attributes: { brand: 'string' },
    path: LTREE_PATH,
    parentId: 'cat-parent',
  };
}

function setup(opts: { found: boolean }) {
  const mock = prisma.$queryRaw as jest.Mock;
  if (!opts.found) {
    mock.mockResolvedValue([]);
    return;
  }
  mock
    .mockResolvedValueOnce([mainRow()]) // main lookup
    .mockResolvedValueOnce([
      // ancestors
      {
        id: 'cat-grandparent',
        name: 'Elektronika',
        nameLv: null,
        nameRu: null,
        nameEn: null,
        attributes: null,
        path: 'elektronika',
        parentId: null,
      },
    ])
    .mockResolvedValueOnce([]); // children
}

async function call(id: string) {
  const req = new NextRequest(`http://localhost/api/categories/${id}`);
  return GET(req, { params: Promise.resolve({ id }) });
}

describe('GET /api/categories/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves a category by UUID', async () => {
    setup({ found: true });
    const res = await call(UUID);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toMatchObject({
      id: UUID,
      path: LTREE_PATH,
      attributes: { brand: 'string' },
      names: { lv: 'Telefoni', ru: 'Телефоны', en: 'Phones' },
    });
    // First raw query filters on c.id for UUID input
    const firstSql = String((prisma.$queryRaw as jest.Mock).mock.calls[0][0]);
    expect(firstSql).toContain('c.id');
    expect(firstSql).not.toContain('::ltree');
  });

  it('resolves a category by ltree path', async () => {
    setup({ found: true });
    const res = await call(LTREE_PATH);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.path).toBe(LTREE_PATH);
    // Non-UUID input must hit the ltree branch
    const firstSql = String((prisma.$queryRaw as jest.Mock).mock.calls[0][0]);
    expect(firstSql).toContain('::ltree');
  });

  it('includes ancestor chain and direct children', async () => {
    setup({ found: true });
    const res = await call(UUID);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.ancestors).toHaveLength(1);
    expect(body.data.ancestors[0]).toMatchObject({
      id: 'cat-grandparent',
      names: { lv: 'Elektronika', ru: 'Elektronika', en: 'Elektronika' }, // falls back to base name
    });
    expect(Array.isArray(body.data.children)).toBe(true);
  });

  it('returns 404 for an unknown id', async () => {
    setup({ found: false });
    const res = await call(UUID);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toMatch(/not found/i);
  });

  it('returns 404 for an unknown ltree path', async () => {
    setup({ found: false });
    const res = await call('nepastas.kategoorias');
    expect(res.status).toBe(404);
  });
});
