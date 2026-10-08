import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSessionUser } from '@/app/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionUser = await getSessionUser(request);
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        listing: {
          select: { id: true, title: true, price: true, images: true, city: true, authorId: true },
        },
        buyer: {
          select: { id: true, name: true, email: true },
        },
        seller: {
          select: { id: true, name: true, email: true },
        },
        disputes: {
          select: { id: true, raisedById: true, reason: true, status: true, resolution: true, createdAt: true },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const currentUserId = sessionUser?.id || userIdParam;
    if (
      currentUserId &&
      transaction.buyerId !== currentUserId &&
      transaction.sellerId !== currentUserId
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Fetch transaction detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionUser = await getSessionUser(request);
    const body = await request.json();
    const { action, reason, userId } = body;

    const currentUserId = sessionUser?.id || userId;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (release | dispute | refund)' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (currentUserId && transaction.buyerId !== currentUserId && transaction.sellerId !== currentUserId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (action === 'release') {
      if (transaction.status !== 'escrow_held' && transaction.status !== 'pending') {
        return NextResponse.json(
          { error: `Cannot release transaction in state: ${transaction.status}` },
          { status: 400 }
        );
      }

      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          status: 'released',
          releasedAt: new Date(),
        },
        include: {
          listing: { select: { id: true, title: true } },
          buyer: { select: { id: true, name: true } },
          seller: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json({
        message: 'Escrow funds successfully released to seller',
        transaction: updated,
      });
    }

    if (action === 'dispute') {
      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        return NextResponse.json(
          { error: 'Dispute reason is required' },
          { status: 400 }
        );
      }

      const raisedById = currentUserId || transaction.buyerId;

      const [updatedTransaction, disputeRecord] = await prisma.$transaction([
        prisma.transaction.update({
          where: { id },
          data: { status: 'disputed' },
        }),
        prisma.dispute.create({
          data: {
            transactionId: id,
            raisedById,
            reason: reason.trim(),
            status: 'open',
          },
        }),
      ]);

      return NextResponse.json({
        message: 'Dispute raised successfully',
        transaction: updatedTransaction,
        dispute: disputeRecord,
      });
    }

    if (action === 'refund') {
      if (transaction.status !== 'escrow_held' && transaction.status !== 'disputed' && transaction.status !== 'pending') {
        return NextResponse.json(
          { error: `Cannot refund transaction in state: ${transaction.status}` },
          { status: 400 }
        );
      }

      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          status: 'refunded',
        },
        include: {
          listing: { select: { id: true, title: true } },
          buyer: { select: { id: true, name: true } },
          seller: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json({
        message: 'Transaction refunded to buyer',
        transaction: updated,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Must be release, dispute, or refund' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
