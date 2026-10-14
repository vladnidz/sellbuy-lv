import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSessionUser } from '@/app/lib/auth-server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: chatId } = await params;
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const whereClause: { chatId: string; createdAt?: { gt: Date } } = { chatId };
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        whereClause.createdAt = { gt: sinceDate };
      }
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: chatId } = await params;
    const sessionUser = await getSessionUser(request);
    const body = await request.json().catch(() => ({}));
    const { content, senderId: reqSenderId } = body;

    const senderId = reqSenderId || sessionUser?.id;

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    if (!senderId) {
      return NextResponse.json({ error: 'Unauthorized: senderId is required' }, { status: 401 });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Content is required and cannot be empty' }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        listing: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Sender must be either buyer or seller
    if (chat.buyerId !== senderId && chat.sellerId !== senderId) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    const trimmedContent = content.trim();

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content: trimmedContent,
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    // Notify the other participant
    const recipientId = senderId === chat.buyerId ? chat.sellerId : chat.buyerId;
    const senderName = senderId === chat.buyerId ? chat.buyer.name : chat.seller.name;
    const listingTitle = chat.listing?.title || 'sludinājumu';

    try {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'chat_message',
          title: `Jauna ziņa: ${senderName || 'Lietotājs'}`,
          message: `${trimmedContent.length > 60 ? trimmedContent.slice(0, 57) + '...' : trimmedContent} (${listingTitle})`,
          link: `/messages/${chatId}`,
        },
      });
    } catch (notifErr) {
      // Don't fail the message if notification fails
      console.warn('Notification creation skipped:', notifErr);
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
