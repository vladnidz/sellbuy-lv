/**
 * Unit tests for GET /api/ratings & POST /api/ratings
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { GET, POST } from '@/app/api/ratings/route';

function mockRating(id: string, score = 5, buyerId = 'buyer-1', sellerId = 'seller-1') {
  return {
    id,
    score,
    comment: 'Lielisks pārdevējs!',
    listingId: 'listing-1',
    buyerId,
    sellerId,
    createdAt: new Date('2026-09-29T10:00:00Z'),
    buyer: { id: buyerId, name: 'Janis B' },
    seller: { id: sellerId, name: 'Anna K' },
    listing: { id: 'listing-1', title: 'iPhone 15 Pro' },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/ratings', () => {
  it('returns empty list and 0 average when no ratings exist', async () => {
    (prisma.rating.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.rating.count as jest.Mock).mockResolvedValue(0);

    const req = new NextRequest('http://localhost/api/ratings');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ratings).toEqual([]);
    expect(body.total).toBe(0);
    expect(body.averageScore).toBe(0);
  });

  it('returns ratings list and calculates averageScore correctly', async () => {
    const ratings = [
      mockRating('r1', 5),
      mockRating('r2', 3),
    ];
    (prisma.rating.findMany as jest.Mock).mockResolvedValue(ratings);
    (prisma.rating.count as jest.Mock).mockResolvedValue(2);

    const req = new NextRequest('http://localhost/api/ratings?sellerId=seller-1');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ratings.length).toBe(2);
    expect(body.total).toBe(2);
    expect(body.averageScore).toBe(4);
    expect(prisma.rating.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sellerId: 'seller-1' },
      })
    );
  });
});

describe('POST /api/ratings', () => {
  it('returns 400 when score is missing or invalid', async () => {
    const req = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'listing-1', score: 6, buyerId: 'buyer-1' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Score must be an integer');
  });

  it('returns 400 when listingId is missing', async () => {
    const req = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({ score: 5, buyerId: 'buyer-1' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('listingId is required');
  });

  it('returns 401 when buyerId/session is missing', async () => {
    const req = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({ score: 5, listingId: 'listing-1' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized: buyerId or session required');
  });

  it('returns 404 when listing does not exist', async () => {
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({ score: 5, listingId: 'nonexistent', buyerId: 'buyer-1' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Listing not found');
  });

  it('returns 400 when buyer tries to rate their own listing', async () => {
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
      id: 'listing-1',
      authorId: 'user-1',
    });

    const req = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({ score: 5, listingId: 'listing-1', buyerId: 'user-1' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Cannot rate your own listing or yourself');
  });

  it('returns 409 when buyer has already rated this listing', async () => {
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
      id: 'listing-1',
      authorId: 'seller-1',
    });

    (prisma.rating.findFirst as jest.Mock).mockResolvedValue(mockRating('r-existing'));

    const req = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({ score: 5, listingId: 'listing-1', buyerId: 'buyer-1' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe('You have already rated this listing');
  });

  it('creates rating successfully and returns 201', async () => {
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
      id: 'listing-1',
      authorId: 'seller-1',
    });

    (prisma.rating.findFirst as jest.Mock).mockResolvedValue(null);

    const createdRating = mockRating('r-new', 5, 'buyer-1', 'seller-1');
    (prisma.rating.create as jest.Mock).mockResolvedValue(createdRating);

    const req = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({
        score: 5,
        comment: 'Ātra piegāde!',
        listingId: 'listing-1',
        buyerId: 'buyer-1',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe('r-new');
    expect(body.score).toBe(5);
    expect(prisma.rating.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          score: 5,
          comment: 'Ātra piegāde!',
          listingId: 'listing-1',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
        },
      })
    );
  });
});
