import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

type UpdateListingBody = {
  title?: unknown;
  description?: unknown;
  price?: unknown;
  images?: unknown;
  categoryId?: unknown;
};

/**
 * Validate an update payload. Only provided fields are validated; returns
 * a typed partial or a string error message.
 */
function validateUpdate(body: UpdateListingBody):
  | { ok: true; data: {
      title?: string;
      description?: string;
      price?: number;
      images?: string[];
      categoryId?: string;
    } }
  | { ok: false; error: string } {
  const data: {
    title?: string;
    description?: string;
    price?: number;
    images?: string[];
    categoryId?: string;
  } = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      return { ok: false, error: 'title must be a non-empty string' };
    }
    if (body.title.length > 200) {
      return { ok: false, error: 'title must be at most 200 characters' };
    }
    data.title = body.title.trim();
  }

  if (body.description !== undefined) {
    if (
      typeof body.description !== 'string' ||
      body.description.trim().length === 0
    ) {
      return { ok: false, error: 'description must be a non-empty string' };
    }
    if (body.description.length > 5000) {
      return { ok: false, error: 'description must be at most 5000 characters' };
    }
    data.description = body.description.trim();
  }

  if (body.price !== undefined) {
    const price = typeof body.price === 'string' ? parseFloat(body.price) : body.price;
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      return { ok: false, error: 'price must be a non-negative number' };
    }
    data.price = price;
  }

  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) {
      return { ok: false, error: 'images must be an array of URL strings' };
    }
    for (const img of body.images as unknown[]) {
      if (typeof img !== 'string') {
        return { ok: false, error: 'images must contain only strings' };
      }
    }
    // Basic URL shape check; allow relative paths starting with '/'
    for (const img of body.images as string[]) {
      try {
        new URL(img);
      } catch {
        if (!img.startsWith('/')) {
          return { ok: false, error: `invalid image URL: ${img}` };
        }
      }
    }
    data.images = body.images;
  }

  if (body.categoryId !== undefined) {
    if (typeof body.categoryId !== 'string' || body.categoryId.length === 0) {
      return { ok: false, error: 'categoryId must be a non-empty string' };
    }
    data.categoryId = body.categoryId;
  }

  return { ok: true, data };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('GET /api/listings/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}

/**
 * PUT /api/listings/[id]
 *
 * Full/partial update of a listing. Requires an `authorId` in the request
 * body matching the listing's owner (no auth layer yet — guard is by
 * ownership match).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let body: UpdateListingBody & { authorId?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Author guard: requester must supply their authorId and own the listing.
    if (typeof body.authorId !== 'string' || body.authorId.length === 0) {
      return NextResponse.json(
        { error: 'authorId is required' },
        { status: 401 }
      );
    }

    const validation = validateUpdate(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existing.authorId !== body.authorId) {
      return NextResponse.json(
        { error: 'Forbidden: only the author may update this listing' },
        { status: 403 }
      );
    }

    // Resolve category if being changed.
    if (validation.data.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: validation.data.categoryId },
        select: { id: true },
      });
      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: validation.data,
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/listings/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    await prisma.listing.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/listings/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
