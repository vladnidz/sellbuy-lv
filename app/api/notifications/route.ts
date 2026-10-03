import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSessionUser } from '@/app/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionUser = await getSessionUser(request);
    const userId = searchParams.get('userId') || sessionUser?.id;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 401 }
      );
    }

    const whereClause = {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    };

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
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
    const { userId, type, title, message, link } = body;

    const targetUserId = userId || sessionUser?.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: type || 'system',
        title,
        message,
        link: link || null,
        read: false,
      },
    });

    return NextResponse.json(
      { success: true, notification },
      { status: 201 }
    );
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    const body = await request.json();
    const { id, markAllRead, userId } = body;

    const targetUserId = userId || sessionUser?.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'userId or authentication required' },
        { status: 401 }
      );
    }

    if (markAllRead) {
      const result = await prisma.notification.updateMany({
        where: { userId: targetUserId, read: false },
        data: { read: true },
      });

      return NextResponse.json({
        success: true,
        updatedCount: result.count,
      });
    }

    if (id) {
      const notification = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      return NextResponse.json({
        success: true,
        notification,
      });
    }

    return NextResponse.json(
      { error: 'id or markAllRead is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
