import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export type LocalizedNames = { lv: string; ru: string; en: string };

type CategoryRow = {
  id: string;
  name: string;
  nameLv: string | null;
  nameRu: string | null;
  nameEn: string | null;
  attributes: Prisma.JsonValue | null;
  path: string;
  parentId: string | null;
  listingCount?: number;
};

/**
 * Build the trilingual `names` object. Falls back to the base `name`
 * column for any language without a dedicated translation.
 */
function localize(row: {
  name: string;
  nameLv: string | null;
  nameRu: string | null;
  nameEn: string | null;
}): LocalizedNames {
  return {
    lv: row.nameLv ?? row.name,
    ru: row.nameRu ?? row.name,
    en: row.nameEn ?? row.name,
  };
}

/**
 * GET /api/categories
 *
 * Query params:
 *   root=true            — only top-level categories (ltree path has no dot)
 *   lang=lv|ru|en        — project names to a single language
 *   withListingCount=true — include per-category listing counts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang');
    const rootOnly = searchParams.get('root') === 'true';
    const withCounts = searchParams.get('withListingCount') === 'true';

    if (lang && !['lv', 'ru', 'en'].includes(lang)) {
      return NextResponse.json(
        { error: 'Invalid lang. Supported values: lv, ru, en' },
        { status: 400 }
      );
    }

    // Root categories are those whose ltree path contains a single label,
    // i.e. no dot — expressed with the ltree match `!~ '*.{'2,}'`.
    const whereSql = rootOnly
      ? Prisma.sql`WHERE c.path !~ '*.{2,}'`
      : Prisma.empty;

    const selectCols = Prisma.sql`
      c.id,
      c.name,
      c."nameLv",
      c."nameRu",
      c."nameEn",
      c.attributes,
      text(c.path) AS path,
      c."parentId"`;

    const rows: CategoryRow[] = withCounts
      ? await prisma.$queryRaw<CategoryRow[]>`
          SELECT ${selectCols},
                 COUNT(l.id)::int AS "listingCount"
          FROM "Category" c
          LEFT JOIN "Listing" l ON l."categoryId" = c.id
          ${whereSql}
          GROUP BY c.id
          ORDER BY c.path`
      : await prisma.$queryRaw<CategoryRow[]>`
          SELECT ${selectCols}
          FROM "Category" c
          ${whereSql}
          ORDER BY c.path`;

    const data = rows.map((row) => ({
      id: row.id,
      path: row.path,
      parentId: row.parentId,
      attributes: row.attributes ?? null,
      names: localize(row),
      ...(withCounts ? { listingCount: Number(row.listingCount ?? 0) } : {}),
    }));

    const projected =
      lang !== null
        ? data.map((c) => ({
            id: c.id,
            name: c.names[lang as 'lv' | 'ru' | 'en'],
            attributes: c.attributes,
            path: c.path,
            parentId: c.parentId,
            ...(withCounts ? { listingCount: c.listingCount } : {}),
          }))
        : data;

    return NextResponse.json({ count: projected.length, data: projected });
  } catch (error) {
    console.error('GET /api/categories failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
