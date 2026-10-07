import { GET, POST } from '@/app/api/users/verify/route';
import { prisma } from '@/app/lib/prisma';
import { NextRequest } from 'next/server';

jest.mock('@/app/lib/prisma');

describe('User Verification API (/api/users/verify)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/verify', () => {
    it('returns 400 if userId is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/users/verify');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Trūkst userId parametra');
    });

    it('returns 404 if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest(
        'http://localhost:3000/api/users/verify?userId=nonexistent-id'
      );
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe('Lietotājs nav atrasts');
    });

    it('returns user verification info and available methods', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Jānis Bērziņš',
        email: 'janis@example.com',
        isVerified: true,
        verifiedTypes: ['smart_id'],
        verifiedAt: new Date('2026-09-01'),
      });

      const req = new NextRequest(
        'http://localhost:3000/api/users/verify?userId=user-1'
      );
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.userId).toBe('user-1');
      expect(data.isVerified).toBe(true);
      expect(data.verifiedTypes).toEqual(['smart_id']);
      expect(data.availableMethods).toEqual(['eparaksts', 'phone', 'email']);
    });
  });

  describe('POST /api/users/verify', () => {
    it('returns 400 if userId or type is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/users/verify', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user-1' }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Obligāti lauki: userId un type');
    });

    it('returns 400 if type is invalid', async () => {
      const req = new NextRequest('http://localhost:3000/api/users/verify', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user-1', type: 'invalid_type' }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Nederīgs verifikācijas veids');
    });

    it('returns 404 if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/users/verify', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user-99', type: 'smart_id' }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe('Lietotājs nav atrasts');
    });

    it('updates user verification status with Smart-ID', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        verifiedTypes: ['phone'],
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Jānis Bērziņš',
        email: 'janis@example.com',
        isVerified: true,
        verifiedTypes: ['phone', 'smart_id'],
        verifiedAt: new Date(),
      });

      const req = new NextRequest('http://localhost:3000/api/users/verify', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          type: 'smart_id',
          personalCode: '120590-12345',
        }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.verifiedTypes).toEqual(['phone', 'smart_id']);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            isVerified: true,
            verifiedTypes: ['phone', 'smart_id'],
            personalCode: '120590-12345',
          }),
        })
      );
    });
  });
});
