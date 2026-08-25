import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';

    const where: Prisma.ListingWhereInput = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (category) {
      const matchingCategories = await prisma.$queryRaw<
        Array<{ id: string }>
      >`SELECT id FROM "Category" WHERE "path" @> ${category}::ltree`;
      const categoryIds = matchingCategories.map(c => c.id);
      if (categoryIds.length > 0) {
        where.categoryId = { in: categoryIds };
      } else {
        where.categoryId = { in: ['__no_match__'] }; // ensures no results
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/listings error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, price, categoryId, description, images, authorId } = body;

    if (!title || !price || !categoryId || !description || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, price, categoryId, description, authorId' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const author = await prisma.user.findUnique({ where: { id: authorId } });
    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        price: parseFloat(price),
        categoryId,
        description,
        authorId,
        images: images || [],
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('POST /api/listings error:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}