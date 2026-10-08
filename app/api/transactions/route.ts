import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSessionUser } from '@/app/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');
    const listingId = searchParams.get('listingId');
    const status = searchParams.get('status');

    const sessionUser = await getSessionUser(request);
    const effectiveUserId = sessionUser?.id || buyerId || sellerId;

    const where: {
      buyerId?: string;
      sellerId?: string;
      listingId?: string;
      status?: string;
      OR?: Array<{ buyerId: string } | { sellerId: string }>;
    } = {};

    if (listingId) where.listingId = listingId;
    if (status) where.status = status;

    if (buyerId && sellerId) {
      where.buyerId = buyerId;
      where.sellerId = sellerId;
    } else if (buyerId) {
      where.buyerId = buyerId;
    } else if (sellerId) {
      where.sellerId = sellerId;
    } else if (effectiveUserId) {
      where.OR = [{ buyerId: effectiveUserId }, { sellerId: effectiveUserId }];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        listing: {
          select: { id: true, title: true, price: true, images: true, city: true },
        },
        buyer: {
          select: { id: true, name: true, email: true },
        },
        seller: {
          select: { id: true, name: true, email: true },
        },
        disputes: {
          select: { id: true, reason: true, status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ transactions, count: transactions.length });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    const body = await request.json();
    const { listingId, paymentProvider = 'montonio' } = body;
    const buyerId = sessionUser?.id || body.buyerId;

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId is required' },
        { status: 400 }
      );
    }

    if (!buyerId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.authorId === buyerId) {
      return NextResponse.json(
        { error: 'Cannot purchase your own listing' },
        { status: 400 }
      );
    }

    const priceNum = Number(listing.price);
    const platformFee = Number((priceNum * 0.03).toFixed(2));
    const escrowDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days hold
    const providerRef = `escrow_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const transaction = await prisma.transaction.create({
      data: {
        listingId,
        buyerId,
        sellerId: listing.authorId,
        amount: priceNum,
        currency: 'EUR',
        platformFee,
        status: 'escrow_held',
        paymentProvider,
        paymentProviderRef: providerRef,
        escrowDeadline,
      },
      include: {
        listing: { select: { id: true, title: true, price: true } },
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(
      {
        transaction,
        feeBreakdown: {
          itemPrice: priceNum,
          platformFee,
          totalAmount: priceNum + platformFee,
          currency: 'EUR',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
