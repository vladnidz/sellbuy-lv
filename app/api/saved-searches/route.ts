import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/saved-searches - Create a new saved search
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await prisma.user.findFirst({
      where: { id: 'user-current-placeholder' } // TODO: Replace with real auth session
    });

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, query, lat, lon, radius, notifyEnabled } = body;

    if (!name || !query) {
      return NextResponse.json(
        { error: 'Name and query are required' },
        { status: 400 }
      );
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: sessionUser.id,
        name,
        query,
        lat: lat ? parseFloat(lat) : null,
        lon: lon ? parseFloat(lon) : null,
        radius: radius ? parseFloat(radius) : null,
        notifyEnabled: notifyEnabled ?? false
      }
    });

    return NextResponse.json(savedSearch, { status: 201 });
  } catch (error) {
    console.error('Error creating saved search:', error);
    return NextResponse.json(
      { error: 'Failed to create saved search' },
      { status: 500 }
    );
  }
}

// GET /api/saved-searches - Get all saved searches for current user
export async function GET() {
  try {
    const sessionUser = await prisma.user.findFirst({
      where: { id: 'user-current-placeholder' } // TODO: Replace with real auth session
    });

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(savedSearches);
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved searches' },
      { status: 500 }
    );
  }
}

// DELETE /api/saved-searches?id=... - Delete a saved search
export async function DELETE(request: NextRequest) {
  try {
    const sessionUser = await prisma.user.findFirst({
      where: { id: 'user-current-placeholder' } // TODO: Replace with real auth session
    });

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID query parameter is required' }, { status: 400 });
    }

    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id }
    });

    if (!savedSearch) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 });
    }

    if (savedSearch.userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.savedSearch.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved search' },
      { status: 500 }
    );
  }
}
