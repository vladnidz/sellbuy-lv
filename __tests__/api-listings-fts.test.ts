/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { GET } from '@/app/api/listings/route';

function setupMock(total = 5) {
  (prisma.listing.findMany as jest.Mock).mockResolvedValue([
    { id: 'l1', title: 'Audi A4', price: 5000, category: { id: 'c1', name: 'Cars' }, author: { id: 'u1', name: 'User' } },
  ]);
  (prisma.listing.count as jest.Mock).mockResolvedValue(total);
  (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ id: 'l1' }]);
}

beforeEach(() => {
  jest.clearAllMocks();
  setupMock();
});

describe('GET /api/listings Full-Text Search (FTS)', () => {
  it('returns valid json response when search query parameter is provided', async () => {
    const req = new NextRequest('http://localhost/api/listings?q=Audi');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('listings');
    expect(json).toHaveProperty('pagination');
    expect(json.listings.length).toBeGreaterThan(0);
  });

  it('handles complex Latvian character query strings gracefully', async () => {
    const req = new NextRequest('http://localhost/api/listings?q=Rīga%20dzīvoklis');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.listings)).toBe(true);
  });
});
