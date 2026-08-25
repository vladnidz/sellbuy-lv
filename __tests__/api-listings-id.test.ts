/**
 * Unit tests for GET + DELETE /api/listings/[id]
 * Prisma is mocked via moduleNameMapper -> __tests__/mocks/prisma.ts
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { DELETE, GET } from '@/app/api/listings/[id]/route';

function foundListing() {
  return {
    id: 'listing-1',
    title: 'iPhone 13',
    price: 450,
    category: { id: 'cat-1', name: 'Telefoni' },
    author: { id: 'u1', name: 'Janis', email: 'janis@example.com' },
  };
}

describe('GET /api/listings/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the listing with category and author included', async () => {
    const listing = foundListing();
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue(listing);

    const req = new NextRequest('http://localhost/api/listings/listing-1');
    const res = await GET(req, { params: Promise.resolve({ id: 'listing-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      id: 'listing-1',
      title: 'iPhone 13',
      category: { id: 'cat-1', name: 'Telefoni' },
      author: { id: 'u1', name: 'Janis' },
    });
    expect(prisma.listing.findUnique).toHaveBeenCalledWith({
      where: { id: 'listing-1' },
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });
  });

  it('returns 404 when the listing does not exist', async () => {
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/listings/nope');
    const res = await GET(req, { params: Promise.resolve({ id: 'nope' }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toMatch(/not found/i);
  });
});

describe('DELETE /api/listings/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes an existing listing and reports success', async () => {
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
      id: 'listing-1',
    });
    (prisma.listing.delete as jest.Mock).mockResolvedValue({ id: 'listing-1' });

    const req = new NextRequest('http://localhost/api/listings/listing-1', {
      method: 'DELETE',
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: 'listing-1' }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(prisma.listing.delete).toHaveBeenCalledWith({
      where: { id: 'listing-1' },
    });
  });

  it('returns 404 when deleting a non-existent listing', async () => {
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/listings/nope', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'nope' }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toMatch(/not found/i);
    expect(prisma.listing.delete).not.toHaveBeenCalled();
  });
});
