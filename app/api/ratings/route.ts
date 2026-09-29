import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSessionUser } from '@/app/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const listingId = searchParams.get('listingId');
    const buyerId = searchParams.get('buyerId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = Math.max(0, (page - 1) * limit);

    const where: { sellerId?: string; listingId?: string; buyerId?: string } = {};
    if (sellerId) where.sellerId = sellerId;
    if (listingId) where.listingId = listingId;
    if (buyerId) where.buyerId = buyerId;

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true } },
          seller: { select: { id: true, name: true } },
          listing: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rating.count({ where }),
    ]);

    const averageScore =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;

    return NextResponse.json({
      ratings,
      total,
      page,
      limit,
      averageScore,
    });
  } catch (error) {
    console.error('Ratings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    const body = await request.json().catch(() => ({}));
    const { listingId, score, comment } = body;
    const buyerId = body.buyerId || sessionUser?.id;

    if (!score || typeof score !== 'number' || score < 1 || score > 5 || !Number.isInteger(score)) {
      return NextResponse.json(
        { error: 'Score must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json(
        { error: 'listingId is required' },
        { status: 400 }
      );
    }

    if (!buyerId) {
      return NextResponse.json(
        { error: 'Unauthorized: buyerId or session required' },
        { status: 401 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, authorId: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const sellerId = listing.authorId;

    if (buyerId === sellerId) {
      return NextResponse.json(
        { error: 'Cannot rate your own listing or yourself' },
        { status: 400 }
      );
    }

    const existingRating = await prisma.rating.findFirst({
      where: {
        listingId,
        buyerId,
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this listing' },
        { status: 409 }
      );
    }

    const rating = await prisma.rating.create({
      data: {
        score,
        comment: typeof comment === 'string' && comment.trim() ? comment.trim() : null,
        listingId,
        buyerId,
        sellerId,
      },
      include: {
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        listing: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error('Rating creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
