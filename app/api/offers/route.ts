import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSessionUser } from '@/app/lib/auth-server';

export const dynamic = 'force-dynamic';

// GET /api/offers?chatId=... - Retrieve offers for a chat thread
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (chat.buyerId !== sessionUser.id && chat.sellerId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const offers = await prisma.offer.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Fetch offers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/offers - Create a structured offer or counter-offer
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { chatId, amount, message } = body;

    if (!chatId || amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid chatId and positive amount are required' }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { listing: true },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (chat.buyerId !== sessionUser.id && chat.sellerId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Default 48-hour expiration window per US-05.04 & EP-05
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const offer = await prisma.offer.create({
      data: {
        chatId,
        buyerId: sessionUser.id,
        amount: Number(amount),
        currency: 'EUR',
        status: 'open',
        message: message ? String(message).trim() : null,
        expiresAt,
      },
      include: {
        buyer: { select: { id: true, name: true } },
      },
    });

    // Automatically post system-style offer notification message into the chat
    const recipientId = chat.buyerId === sessionUser.id ? chat.sellerId : chat.buyerId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'offer_received',
        title: 'Jauns piedāvājums par preci',
        message: `${sessionUser.name || 'Lietotājs'} piedāvā €${Number(amount).toFixed(2)} par sludinājumu "${chat.listing.title}"`,
        link: `/messages/${chatId}`,
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('Create offer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/offers?id=... - Accept or decline an offer
export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, action } = body; // action: 'accept' | 'decline'

    if (!id || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Valid offer id and action (accept/decline) are required' }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { chat: { include: { listing: true } } },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Only chat counterpart can accept/decline an offer
    const isCounterpart =
      (offer.buyerId === offer.chat.buyerId && sessionUser.id === offer.chat.sellerId) ||
      (offer.buyerId === offer.chat.sellerId && sessionUser.id === offer.chat.buyerId);

    if (!isCounterpart) {
      return NextResponse.json({ error: 'Only the recipient can accept or decline this offer' }, { status: 403 });
    }

    if (offer.status !== 'open') {
      return NextResponse.json({ error: `Offer is already ${offer.status}` }, { status: 400 });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { status: newStatus },
    });

    // Notify original offer maker of decision
    await prisma.notification.create({
      data: {
        userId: offer.buyerId,
        type: `offer_${newStatus}`,
        title: action === 'accept' ? 'Piedāvājums pieņemts! 🎉' : 'Piedāvājums noraidīts',
        message:
          action === 'accept'
            ? `Jūsu piedāvājums €${Number(offer.amount).toFixed(2)} par "${offer.chat.listing.title}" tika pieņemts!`
            : `Piedāvājums €${Number(offer.amount).toFixed(2)} par "${offer.chat.listing.title}" tika noraidīts.`,
        link: `/messages/${offer.chatId}`,
      },
    });

    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error('Update offer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
