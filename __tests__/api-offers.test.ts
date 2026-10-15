/**
 * Unit tests for In-Chat Offers API (US-05.04 & EP-05)
 * (GET, POST, PATCH /api/offers)
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { POST, PATCH } from '@/app/api/offers/route';
import { signToken, COOKIE_NAME } from '@/app/lib/auth-server';

function makeAuthRequest(url: string, user: { id: string; email: string }, init: RequestInit = {}) {
  const token = signToken({ id: user.id, email: user.email, name: 'Test User' });
  const headers = new Headers(init.headers || {});
  headers.set('cookie', `${COOKIE_NAME}=${token}`);
  return new NextRequest(url, {
    ...init,
    headers,
  } as ConstructorParameters<typeof NextRequest>[1]);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/offers', () => {
  it('returns 401 when unauthorized', async () => {
    const req = new NextRequest('http://localhost/api/offers', {
      method: 'POST',
      body: JSON.stringify({ chatId: 'c-1', amount: 100 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when amount is invalid', async () => {
    const req = makeAuthRequest('http://localhost/api/offers', { id: 'buyer-1', email: 'b@test.com' }, {
      method: 'POST',
      body: JSON.stringify({ chatId: 'c-1', amount: -50 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates an open offer successfully', async () => {
    (prisma.chat.findUnique as jest.Mock).mockResolvedValue({
      id: 'c-1',
      buyerId: 'user-1',
      sellerId: 'seller-1',
      listing: { title: 'iPhone 15' },
    });

    const mockOffer = {
      id: 'off-1',
      chatId: 'c-1',
      buyerId: 'user-1',
      amount: 450,
      status: 'open',
    };
    (prisma.offer.create as jest.Mock).mockResolvedValue(mockOffer);

    const req = makeAuthRequest('http://localhost/api/offers', { id: 'user-1', email: 'b@test.com' }, {
      method: 'POST',
      body: JSON.stringify({ chatId: 'c-1', amount: 450, message: 'Vai par 450 atdosi?' }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe('off-1');
    expect(body.amount).toBe(450);
  });
});

describe('PATCH /api/offers', () => {
  it('accepts offer when called by seller', async () => {
    (prisma.offer.findUnique as jest.Mock).mockResolvedValue({
      id: 'off-1',
      chatId: 'c-1',
      buyerId: 'buyer-1',
      amount: 450,
      status: 'open',
      chat: {
        buyerId: 'buyer-1',
        sellerId: 'user-1',
        listing: { title: 'iPhone 15' },
      },
    });

    (prisma.offer.update as jest.Mock).mockResolvedValue({
      id: 'off-1',
      status: 'accepted',
    });

    const req = makeAuthRequest('http://localhost/api/offers', { id: 'user-1', email: 's@test.com' }, {
      method: 'PATCH',
      body: JSON.stringify({ id: 'off-1', action: 'accept' }),
    });

    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('accepted');
    expect(prisma.notification.create).toHaveBeenCalled();
  });
});
