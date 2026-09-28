/**
 * Unit tests for Auth API endpoints (/api/auth/login, /api/auth/register, /api/auth/me, /api/auth/logout)
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { POST as registerPOST } from '@/app/api/auth/register/route';
import { GET as meGET } from '@/app/api/auth/me/route';
import { POST as logoutPOST } from '@/app/api/auth/logout/route';
import { signToken } from '@/app/lib/auth-server';

jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mocked-jwt-token'),
  })),
  jwtVerify: jest.fn().mockImplementation(async (token: string) => {
    if (token === 'invalid-token') {
      throw new Error('Invalid token');
    }
    return {
      payload: {
        id: 'u1',
        email: 'test@example.com',
        name: 'Test',
      },
    };
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/register', () => {
  it('returns 400 when missing email or password', async () => {
    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: '123' }),
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(400);
  });

  it('returns 409 when user already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', email: 'test@example.com' });
    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    const res = await registerPOST(req);
    expect(res.status).toBe(409);
  });

  it('creates user and returns 201 with token', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      name: 'Test User',
    });

    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test User' }),
    });
    const res = await registerPOST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.user.email).toBe('test@example.com');
    expect(body.token).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 when missing credentials', async () => {
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    const res = await loginPOST(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 when user does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    const res = await loginPOST(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when password is invalid', async () => {
    const hashedPassword = await bcrypt.hash('correctpassword', 10);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      password: hashedPassword,
    });

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    });
    const res = await loginPOST(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 with user and token when password matches', async () => {
    const hashedPassword = await bcrypt.hash('correctpassword', 10);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    });

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'correctpassword' }),
    });
    const res = await loginPOST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.email).toBe('test@example.com');
    expect(body.user.password).toBeUndefined();
    expect(body.token).toBeDefined();
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 when request has no token or session', async () => {
    const req = new NextRequest('http://localhost/api/auth/me');
    const res = await meGET(req);
    expect(res.status).toBe(401);
  });

  it('returns 200 with user payload when token is valid', async () => {
    const token = await signToken({ id: 'u1', email: 'test@example.com', name: 'Test' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      name: 'Test',
      phone: null,
      avatarUrl: null,
      role: 'USER',
      createdAt: new Date().toISOString(),
    });

    const req = new NextRequest('http://localhost/api/auth/me', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const res = await meGET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user.id).toBe('u1');
    expect(body.user.email).toBe('test@example.com');
  });
});

describe('POST /api/auth/logout', () => {
  it('clears session cookie and returns success', async () => {
    const res = await logoutPOST();
    expect(res.status).toBe(200);
    const cookieHeader = res.headers.get('set-cookie');
    expect(cookieHeader).toContain('sellbuy_session=;');
  });
});
