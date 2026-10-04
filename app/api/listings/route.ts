import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';
import { getFtsListingWhere } from '@/app/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const city = searchParams.get('city')?.trim();
    const categorySlug = searchParams.get('category')?.trim();
    const sort = searchParams.get('sort') || 'newest';
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;

    const where: Prisma.ListingWhereInput = {};

    // Apply FTS using getFtsListingWhere
    if (query) {
      const ftsWhere = await getFtsListingWhere(query);
      if (ftsWhere && Object.keys(ftsWhere).length > 0) {
        Object.assign(where, ftsWhere);
      }
    }

    // City filter
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    // Min / Max Price filter
    if ((minPrice !== undefined && !isNaN(minPrice)) || (maxPrice !== undefined && !isNaN(maxPrice))) {
      where.price = {
        gte: minPrice !== undefined && !isNaN(minPrice) ? minPrice : undefined,
        lte: maxPrice !== undefined && !isNaN(maxPrice) ? maxPrice : undefined,
      };
    }

    // Category filter (via ltree descendant lookup)
    if (categorySlug) {
      let categoryIds: string[] = [];
      try {
        const matchingCats = await prisma.$queryRaw<Array<{ id: string }>>(
          Prisma.sql`SELECT id FROM "Category" WHERE (SELECT path FROM "Category" WHERE id = ${categorySlug}) @> path OR id = ${categorySlug}`
        );
        if (Array.isArray(matchingCats) && matchingCats.length > 0) {
          categoryIds = matchingCats.map((c) => c.id);
        }
      } catch {
        // Fallback to prisma.category.findFirst if raw SQL fails
        const category = await prisma.category.findFirst({
          where: {
            OR: [
              { id: categorySlug },
              { name: categorySlug }
            ]
          },
          select: { id: true }
        });
        if (category) categoryIds = [category.id];
      }

      if (categoryIds.length === 0) {
        categoryIds = ['__no_match__'];
      }

      where.categoryId = { in: categoryIds };
    }

    // Handle sorting
    let orderByClause: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc' || sort === 'price-asc') {
      orderByClause = { price: 'asc' };
    } else if (sort === 'price_desc' || sort === 'price-desc') {
      orderByClause = { price: 'desc' };
    } else if (sort === 'oldest') {
      orderByClause = { createdAt: 'asc' };
    }

    const skip = Math.max(0, (page - 1) * limit);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderByClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameLv: true,
              nameRu: true,
              nameEn: true
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.listing.count({ where })
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}
