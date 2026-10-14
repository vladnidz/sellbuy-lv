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
    const sessionUser = await getSessionUser(request);
    const userId = searchParams.get('userId') || sessionUser?.id;

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            city: true,
            authorId: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // If userId is provided, ensure user is a participant
    if (userId && chat.buyerId !== userId && chat.sellerId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You are not a participant in this chat' }, { status: 403 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Fetch chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: chatId } = await params;
    const sessionUser = await getSessionUser(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || sessionUser?.id;

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (userId && chat.buyerId !== userId && chat.sellerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete messages first then chat
    await prisma.message.deleteMany({
      where: { chatId },
    });
    await prisma.chat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
