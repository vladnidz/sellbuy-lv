/**
 * Unit tests for GET /api/chats & POST /api/chats
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { GET, POST } from '@/app/api/chats/route';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/chats', () => {
  it('returns 400 when userId is missing and no session user', async () => {
    const req = new NextRequest('http://localhost/api/chats');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('userId is required');
  });

  it('returns chats when userId is provided', async () => {
    const mockChats = [
      {
        id: 'chat-1',
        listingId: 'listing-1',
        buyerId: 'user-1',
        sellerId: 'user-2',
        createdAt: new Date(),
        buyer: { id: 'user-1', name: 'Buyer' },
        seller: { id: 'user-2', name: 'Seller' },
        listing: { id: 'listing-1', title: 'Test Item', price: 100, images: [] },
        messages: [],
      },
    ];
    (prisma.chat.findMany as jest.Mock).mockResolvedValue(mockChats);

    const req = new NextRequest('http://localhost/api/chats?userId=user-1');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(JSON.parse(JSON.stringify(mockChats)));
  });
});

describe('POST /api/chats', () => {
  it('returns 400 when listingId is missing', async () => {
    const req = new NextRequest('http://localhost/api/chats', {
      method: 'POST',
      body: JSON.stringify({ buyerId: 'user-1' }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('listingId is required');
  });

  it('returns 401 when buyerId is missing', async () => {
    const req = new NextRequest('http://localhost/api/chats', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'listing-1' }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain('Unauthorized');
  });

  it('returns 404 when listing is not found', async () => {
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/chats', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'nonexistent', buyerId: 'user-1' }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Listing not found');
  });

  it('returns 400 when buyer is the listing author', async () => {
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
      id: 'listing-1',
      authorId: 'user-1',
    });

    const req = new NextRequest('http://localhost/api/chats', {
      method: 'POST',
      body: JSON.stringify({ listingId: 'listing-1', buyerId: 'user-1' }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Cannot start a chat with yourself');
  });

  it('creates new chat and initial message when none exists', async () => {
    (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
      id: 'listing-1',
      authorId: 'seller-1',
    });
    (prisma.chat.findFirst as jest.Mock).mockResolvedValue(null);
    const newChat = {
      id: 'chat-new',
      listingId: 'listing-1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      messages: [{ id: 'msg-1', content: 'Hello', senderId: 'buyer-1' }],
    };
    (prisma.chat.create as jest.Mock).mockResolvedValue(newChat);

    const req = new NextRequest('http://localhost/api/chats', {
      method: 'POST',
      body: JSON.stringify({
        listingId: 'listing-1',
        buyerId: 'buyer-1',
        initialMessage: 'Hello',
      }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.isNew).toBe(true);
    expect(body.chat).toBeDefined();
  });
});
