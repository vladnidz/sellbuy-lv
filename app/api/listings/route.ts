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
    const city = searchParams.get('city');
    const attributesParam = searchParams.get('attributes');

    const where: Prisma.ListingWhereInput = {};

    if (city) {
      // Exact match on city (case-insensitive) to keep results predictable.
      where.city = { equals: city, mode: 'insensitive' };
    }

    // Attribute-driven JSONB filtering. Accepts a JSON object where each key
    // is an attribute name and the value is either:
    //   - a scalar  -> exact containment: attributes @> {"key": value}
    //   - an object -> range filter:     { min, max } on the numeric value
    // e.g. ?attributes={"color":"red","year":{"min":2015,"max":2020}}
    if (attributesParam) {
      let attrFilter: Record<string, unknown>;
      try {
        attrFilter = JSON.parse(attributesParam);
      } catch {
        return NextResponse.json(
          { error: 'Invalid `attributes` param: must be valid JSON' },
          { status: 400 }
        );
      }
      if (
        typeof attrFilter !== 'object' ||
        attrFilter === null ||
        Array.isArray(attrFilter)
      ) {
        return NextResponse.json(
          { error: 'Invalid `attributes` param: must be a JSON object' },
          { status: 400 }
        );
      }

      const equalityKeys: string[] = [];
      const rangeKeys: Array<{ key: string; min?: number; max?: number }> = [];

      for (const [key, value] of Object.entries(attrFilter)) {
        if (value !== null && typeof value === 'object') {
          const range = value as { min?: unknown; max?: unknown };
          const min = typeof range.min === 'number' ? range.min : undefined;
          const max = typeof range.max === 'number' ? range.max : undefined;
          if (min === undefined && max === undefined) {
            return NextResponse.json(
              { error: `Invalid attribute range for key "${key}": min/max must be numbers` },
              { status: 400 }
            );
          }
          rangeKeys.push({ key, min, max });
        } else {
          equalityKeys.push(key);
        }
      }

      // If there are attribute filters, fetch matching listing IDs first,
      // then intersect with the Prisma where via id IN (...).
      if (equalityKeys.length > 0 || rangeKeys.length > 0) {
        const conditions: Prisma.Sql[] = [];
        const params: unknown[] = [];

        // Equality conditions: attributes @> jsonb_build_object('key', 'value')
        for (const key of equalityKeys) {
          const value = attrFilter[key];
          conditions.push(
            Prisma.sql`"attributes" @> jsonb_build_object(${key}::text, ${value}::jsonb)`
          );
        }

        // Range conditions: extract numeric value and compare
        for (const { key, min, max } of rangeKeys) {
          const numericExpr = Prisma.sql`NULLIF(regexp_replace("attributes"->>${key}, '[^0-9.\-]', '', 'g'), '')::numeric`;
          if (min !== undefined && max !== undefined) {
            conditions.push(
              Prisma.sql`${numericExpr} BETWEEN ${min} AND ${max}`
            );
          } else if (min !== undefined) {
            conditions.push(Prisma.sql`${numericExpr} >= ${min}`);
          } else if (max !== undefined) {
            conditions.push(Prisma.sql`${numericExpr} <= ${max}`);
          }
        }

        const whereClause = Prisma.join(conditions, ' AND ');
        const matchingIds = await prisma.$queryRaw<Array<{ id: string }>>(
          Prisma.sql`SELECT id FROM "Listing" WHERE ${whereClause}`
        );

        if (matchingIds.length === 0) {
          // No listings match the attribute filters; return empty result early.
          return NextResponse.json({
            listings: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          });
        }

        where.id = { in: matchingIds.map(m => m.id) };
      }
    }

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
    const { title, price, categoryId, description, images, authorId, city, attributes } = body;

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
        city: city || null,
        attributes: attributes || null,
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