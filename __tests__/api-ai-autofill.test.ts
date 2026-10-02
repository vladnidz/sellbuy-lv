/**
 * Unit tests for POST /api/ai/listing-autofill
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/listing-autofill/route';
import { prisma } from '@/app/lib/prisma';

jest.mock('@/app/lib/prisma', () => ({
  prisma: {
    category: {
      findFirst: jest.fn(),
    },
    listing: {
      aggregate: jest.fn(),
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  (prisma.category.findFirst as jest.Mock).mockResolvedValue({
    id: 'cat-auto-1',
    name: 'Automobiļi',
  });
  (prisma.listing.aggregate as jest.Mock).mockResolvedValue({
    _avg: { price: 4500 },
    _min: { price: 1200 },
    _max: { price: 15000 },
  });
});

describe('POST /api/ai/listing-autofill', () => {
  it('returns 400 when title is missing or empty', async () => {
    const req = new NextRequest('http://localhost/api/ai/listing-autofill', {
      method: 'POST',
      body: JSON.stringify({ title: '' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('generates suggested description and price benchmark for valid title', async () => {
    const req = new NextRequest('http://localhost/api/ai/listing-autofill', {
      method: 'POST',
      body: JSON.stringify({ title: 'Audi A6 3.0 TDI' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.title).toBe('Audi A6 3.0 TDI');
    expect(json.description).toContain('Audi A6 3.0 TDI');
    expect(json.categoryId).toBe('cat-auto-1');
    expect(json.priceBenchmark).toEqual({ avg: 4500, min: 1200, max: 15000 });
  });
});
