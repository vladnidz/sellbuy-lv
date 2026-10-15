/**
 * Unit tests for Saved Searches API
 * (POST, GET, DELETE /api/saved-searches)
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { GET, POST, DELETE } from '@/app/api/saved-searches/route';
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

describe('POST /api/saved-searches', () => {
  it('returns 401 when unauthorized', async () => {
    const req = new NextRequest('http://localhost/api/saved-searches', {
      method: 'POST',
      body: JSON.stringify({ name: 'BMW Auto', query: { q: 'BMW' } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when name or query is missing', async () => {
    const req = makeAuthRequest('http://localhost/api/saved-searches', { id: 'user-1', email: 'test@example.com' }, {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates saved search successfully with json query and notifications', async () => {
    const mockSavedSearch = {
      id: 'saved-1',
      userId: 'user-1',
      name: 'BMW Rīga',
      query: { q: 'BMW', city: 'Rīga' },
      lat: null,
      lon: null,
      radius: null,
      notifyEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.savedSearch.create as jest.Mock).mockResolvedValue(mockSavedSearch);

    const req = makeAuthRequest('http://localhost/api/saved-searches', { id: 'user-1', email: 'test@example.com' }, {
      method: 'POST',
      body: JSON.stringify({
        name: 'BMW Rīga',
        query: { q: 'BMW', city: 'Rīga' },
        notifyEnabled: true,
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe('saved-1');
    expect(body.name).toBe('BMW Rīga');
    expect(prisma.savedSearch.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        name: 'BMW Rīga',
        notifyEnabled: true,
      }),
    });
  });
});

describe('GET /api/saved-searches', () => {
  it('returns 401 when unauthorized', async () => {
    const req = new NextRequest('http://localhost/api/saved-searches');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('returns list of saved searches for current session user', async () => {
    const mockList = [
      {
        id: 'saved-1',
        userId: 'user-1',
        name: 'Audi A4',
        query: { q: 'Audi' },
        notifyEnabled: false,
      },
    ];

    (prisma.savedSearch.findMany as jest.Mock).mockResolvedValue(mockList);

    const req = makeAuthRequest('http://localhost/api/saved-searches', { id: 'user-1', email: 'test@example.com' });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(mockList);
    expect(prisma.savedSearch.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
  });
});

describe('DELETE /api/saved-searches', () => {
  it('returns 401 when unauthorized', async () => {
    const req = new NextRequest('http://localhost/api/saved-searches?id=saved-1', {
      method: 'DELETE',
    });
    const res = await DELETE(req);

    expect(res.status).toBe(401);
  });

  it('returns 404 if saved search not found', async () => {
    (prisma.savedSearch.findUnique as jest.Mock).mockResolvedValue(null);

    const req = makeAuthRequest('http://localhost/api/saved-searches?id=saved-missing', { id: 'user-1', email: 'test@example.com' }, {
      method: 'DELETE',
    });
    const res = await DELETE(req);

    expect(res.status).toBe(404);
  });

  it('returns 403 if saved search belongs to another user', async () => {
    (prisma.savedSearch.findUnique as jest.Mock).mockResolvedValue({
      id: 'saved-1',
      userId: 'user-attacker',
    });

    const req = makeAuthRequest('http://localhost/api/saved-searches?id=saved-1', { id: 'user-1', email: 'test@example.com' }, {
      method: 'DELETE',
    });
    const res = await DELETE(req);

    expect(res.status).toBe(403);
  });

  it('deletes saved search successfully', async () => {
    (prisma.savedSearch.findUnique as jest.Mock).mockResolvedValue({
      id: 'saved-1',
      userId: 'user-1',
    });
    (prisma.savedSearch.delete as jest.Mock).mockResolvedValue({ id: 'saved-1' });

    const req = makeAuthRequest('http://localhost/api/saved-searches?id=saved-1', { id: 'user-1', email: 'test@example.com' }, {
      method: 'DELETE',
    });
    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(prisma.savedSearch.delete).toHaveBeenCalledWith({
      where: { id: 'saved-1' },
    });
  });
});
