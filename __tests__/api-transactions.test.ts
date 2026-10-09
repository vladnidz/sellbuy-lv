/**
 * Unit tests for Transaction & Escrow API Endpoints:
 * - GET /api/transactions
 * - POST /api/transactions/initiate
 * - GET /api/transactions/[id]
 * - PATCH /api/transactions/[id]
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { GET as getTransactions } from '@/app/api/transactions/route';
import { POST as initiateTransaction } from '@/app/api/transactions/initiate/route';
import { GET as getTransactionById, PATCH as updateTransactionById } from '@/app/api/transactions/[id]/route';
import { signToken, COOKIE_NAME } from '@/app/lib/auth-server';

function mockTransaction(id = 'tx-1', status = 'pending') {
  return {
    id,
    listingId: 'listing-1',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    amount: 150.0,
    status,
    paymentProvider: 'montonio',
    createdAt: new Date('2026-10-08T12:00:00Z'),
    updatedAt: new Date('2026-10-08T12:00:00Z'),
    releasedAt: status === 'released' ? new Date('2026-10-08T14:00:00Z') : null,
    listing: { id: 'listing-1', title: 'iPhone 13', price: 150.0, images: ['/img1.jpg'], city: 'Rīga' },
    buyer: { id: 'buyer-1', name: 'Buyer User', email: 'buyer@example.com' },
    seller: { id: 'seller-1', name: 'Seller User', email: 'seller@example.com' },
    disputes: [],
  };
}

describe('Transactions API Endpoints', () => {
  let buyerToken: string;

  beforeAll(async () => {
    buyerToken = await signToken({ id: 'buyer-1', email: 'buyer@example.com', name: 'Buyer User' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/transactions', () => {
    it('returns transactions for authorized user', async () => {
      const tx = mockTransaction();
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([tx]);

      const req = new NextRequest('http://localhost/api/transactions', {
        headers: { Cookie: `${COOKIE_NAME}=${buyerToken}` },
      });
      const res = await getTransactions(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.transactions).toHaveLength(1);
      expect(body.transactions[0].id).toBe('tx-1');
    });

    it('filters transactions by status and listingId when specified', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      const req = new NextRequest('http://localhost/api/transactions?listingId=listing-1&status=pending', {
        headers: { Cookie: `${COOKIE_NAME}=${buyerToken}` },
      });
      const res = await getTransactions(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.transactions).toEqual([]);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            listingId: 'listing-1',
            status: 'pending',
          }),
        })
      );
    });
  });

  describe('POST /api/transactions/initiate', () => {
    it('returns 401 if unauthenticated', async () => {
      const req = new NextRequest('http://localhost/api/transactions/initiate', {
        method: 'POST',
        body: JSON.stringify({ listingId: 'listing-1', amount: 150 }),
      });
      const res = await initiateTransaction(req);
      expect(res.status).toBe(401);
    });

    it('returns 404 if listing does not exist', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/transactions/initiate', {
        method: 'POST',
        headers: { Cookie: `${COOKIE_NAME}=${buyerToken}` },
        body: JSON.stringify({ listingId: 'listing-invalid', amount: 150 }),
      });
      const res = await initiateTransaction(req);
      expect(res.status).toBe(404);
    });

    it('creates a new transaction successfully', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: 'listing-1',
        title: 'iPhone 13',
        authorId: 'seller-1',
      });
      const createdTx = mockTransaction('tx-new', 'pending');
      (prisma.transaction.create as jest.Mock).mockResolvedValue(createdTx);

      const req = new NextRequest('http://localhost/api/transactions/initiate', {
        method: 'POST',
        headers: { Cookie: `${COOKIE_NAME}=${buyerToken}` },
        body: JSON.stringify({ listingId: 'listing-1', amount: 150, paymentProvider: 'montonio' }),
      });
      const res = await initiateTransaction(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.transaction.id).toBe('tx-new');
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          listingId: 'listing-1',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          amount: 150,
          status: 'pending',
          paymentProvider: 'montonio',
        },
      });
    });
  });

  describe('GET /api/transactions/[id]', () => {
    it('returns 404 if transaction is not found', async () => {
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/transactions/tx-999', {
        headers: { Cookie: `${COOKIE_NAME}=${buyerToken}` },
      });
      const res = await getTransactionById(req, { params: Promise.resolve({ id: 'tx-999' }) });
      expect(res.status).toBe(404);
    });

    it('returns 403 if user is not buyer or seller', async () => {
      const otherToken = await signToken({ id: 'other-user', email: 'other@example.com' });
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(mockTransaction());

      const req = new NextRequest('http://localhost/api/transactions/tx-1', {
        headers: { Cookie: `${COOKIE_NAME}=${otherToken}` },
      });
      const res = await getTransactionById(req, { params: Promise.resolve({ id: 'tx-1' }) });
      expect(res.status).toBe(403);
    });

    it('returns transaction detail for authorized user', async () => {
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(mockTransaction());

      const req = new NextRequest('http://localhost/api/transactions/tx-1', {
        headers: { Cookie: `${COOKIE_NAME}=${buyerToken}` },
      });
      const res = await getTransactionById(req, { params: Promise.resolve({ id: 'tx-1' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.transaction.id).toBe('tx-1');
    });
  });

  describe('PATCH /api/transactions/[id]', () => {
    it('returns 400 if action is missing', async () => {
      const req = new NextRequest('http://localhost/api/transactions/tx-1', {
        method: 'PATCH',
        headers: { Cookie: `${COOKIE_NAME}=${buyerToken}` },
        body: JSON.stringify({}),
      });
      const res = await updateTransactionById(req, { params: Promise.resolve({ id: 'tx-1' }) });
      expect(res.status).toBe(400);
    });

    it('releases escrow funds when action is release', async () => {
      const tx = mockTransaction('tx-1', 'pending');
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(tx);
      (prisma.transaction.update as jest.Mock).mockResolvedValue({
        ...tx,
        status: 'released',
        releasedAt: new Date(),
      });

      const req = new NextRequest('http://localhost/api/transactions/tx-1', {
        method: 'PATCH',
        headers: { Cookie: `${COOKIE_NAME}=${buyerToken}` },
        body: JSON.stringify({ action: 'release' }),
      });
      const res = await updateTransactionById(req, { params: Promise.resolve({ id: 'tx-1' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toContain('released');
      expect(body.transaction.status).toBe('released');
    });

    it('opens dispute when action is dispute with reason', async () => {
      const tx = mockTransaction('tx-1', 'pending');
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(tx);
      (prisma.transaction.update as jest.Mock).mockResolvedValue({ ...tx, status: 'disputed' });
      (prisma.dispute.create as jest.Mock).mockResolvedValue({
        id: 'disp-1',
        transactionId: 'tx-1',
        raisedById: 'buyer-1',
        reason: 'Item arrived damaged',
        status: 'open',
      });

      const req = new NextRequest('http://localhost/api/transactions/tx-1', {
        method: 'PATCH',
        headers: { Cookie: `${COOKIE_NAME}=${buyerToken}` },
        body: JSON.stringify({ action: 'dispute', reason: 'Item arrived damaged' }),
      });
      const res = await updateTransactionById(req, { params: Promise.resolve({ id: 'tx-1' }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toContain('Dispute raised');
      expect(body.dispute.reason).toBe('Item arrived damaged');
    });
  });
});
