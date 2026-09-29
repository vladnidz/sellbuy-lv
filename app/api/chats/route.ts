import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSessionUser } from '@/app/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionUser = await getSessionUser(request);
    const userId = searchParams.get('userId') || sessionUser?.id;
    const listingId = searchParams.get('listingId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const whereClause: {
      OR: Array<{ buyerId: string } | { sellerId: string }>;
      listingId?: string;
    } = {
      OR: [
        { buyerId: userId },
        { sellerId: userId },
      ],
    };

    if (listingId) {
      whereClause.listingId = listingId;
    }

    const chats = await prisma.chat.findMany({
      where: whereClause,
      include: {
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        listing: { select: { id: true, title: true, price: true, images: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Chats fetch error:', error);
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
    const { listingId, initialMessage } = body;
    const buyerId = body.buyerId || sessionUser?.id;

    if (!listingId) {
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

    if (buyerId === listing.authorId) {
      return NextResponse.json(
        { error: 'Cannot start a chat with yourself' },
        { status: 400 }
      );
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        listingId,
        buyerId,
        sellerId: listing.authorId,
      },
      include: {
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        listing: { select: { id: true, title: true, price: true, images: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (existingChat) {
      let createdMessage = null;
      if (initialMessage && typeof initialMessage === 'string' && initialMessage.trim()) {
        createdMessage = await prisma.message.create({
          data: {
            chatId: existingChat.id,
            senderId: buyerId,
            content: initialMessage.trim(),
          },
        });
      }

      return NextResponse.json(
        {
          chat: existingChat,
          isNew: false,
          message: createdMessage,
        },
        { status: 200 }
      );
    }

    const trimmedMsg = typeof initialMessage === 'string' ? initialMessage.trim() : '';

    const chat = await prisma.chat.create({
      data: {
        listingId,
        buyerId,
        sellerId: listing.authorId,
        messages: trimmedMsg
          ? {
              create: {
                senderId: buyerId,
                content: trimmedMsg,
              },
            }
          : undefined,
      },
      include: {
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        listing: { select: { id: true, title: true, price: true, images: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json(
      {
        chat,
        isNew: true,
        message: chat.messages?.[0] || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Chat creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
