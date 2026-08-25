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

/**
 * Slugify a category name for use as an ltree label. ltree labels are
 * restricted to lowercase letters, digits, and underscores — so we
 * lowercase, collapse non-alphanumerics to underscores, and trim edges.
 */
function toLtreeLabel(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

type CategoryBody = {
  name: unknown;
  nameLv?: unknown;
  nameRu?: unknown;
  nameEn?: unknown;
  attributes?: unknown;
  parentId?: unknown;
};

/**
 * POST /api/categories
 *
 * Creates a new category. The ltree `path` is computed as
 * `parent.path + '.' + slugified(name)` (root categories use the slug
 * alone). The `@unique` constraint on `path` enforces uniqueness — a
 * duplicate raises P2002, surfaced as a 409.
 */
export async function POST(request: NextRequest) {
  try {
    let body: CategoryBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (
      typeof body.name !== 'string' ||
      body.name.trim().length === 0
    ) {
      return NextResponse.json(
        { error: 'name must be a non-empty string' },
        { status: 400 }
      );
    }
    if (body.name.length > 200) {
      return NextResponse.json(
        { error: 'name must be at most 200 characters' },
        { status: 400 }
      );
    }

    const localizedFields = ['nameLv', 'nameRu', 'nameEn'];
    for (const field of localizedFields) {
      const value = (body as Record<string, unknown>)[field];
      if (
        value !== undefined &&
        (typeof value !== 'string' || value.trim().length === 0)
      ) {
        return NextResponse.json(
          { error: `${field} must be a non-empty string` },
          { status: 400 }
        );
      }
    }

    // Resolve parent (if provided) and build the ltree path.
    let path: string;
    let resolvedParentId: string | null = null;

    if (body.parentId !== undefined) {
      if (typeof body.parentId !== 'string' || body.parentId.length === 0) {
        return NextResponse.json(
          { error: 'parentId must be a non-empty string' },
          { status: 400 }
        );
      }

      const parent = await prisma.category.findUnique({
        where: { id: body.parentId },
        select: { id: true, path: true },
      });
      if (!parent) {
        return NextResponse.json(
          { error: 'parent category not found' },
          { status: 404 }
        );
      }

      resolvedParentId = parent.id;
      path = `${parent.path}.${toLtreeLabel(body.name)}`;
    } else {
      path = toLtreeLabel(body.name);
    }

    if (!path || path.length > 500) {
      return NextResponse.json(
        { error: 'computed path is empty or too long' },
        { status: 400 }
      );
    }

    try {
      const category = await prisma.category.create({
        data: {
          name: body.name.trim(),
          nameLv:
            (body.nameLv as string | undefined) && (body.nameLv as string).trim()
              ? (body.nameLv as string).trim()
              : undefined,
          nameRu:
            (body.nameRu as string | undefined) && (body.nameRu as string).trim()
              ? (body.nameRu as string).trim()
              : undefined,
          nameEn:
            (body.nameEn as string | undefined) && (body.nameEn as string).trim()
              ? (body.nameEn as string).trim()
              : undefined,
          attributes: body.attributes ?? undefined,
          parentId: resolvedParentId,
          path: path as any, // ltree Unsupported type — computed from parent
        },
        include: {
          parent: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json(
        {
          id: category.id,
          name: category.name,
          names: {
            lv: category.nameLv ?? category.name,
            ru: category.nameRu ?? category.name,
            en: category.nameEn ?? category.name,
          },
          attributes: category.attributes,
          path,
          parentId: category.parentId,
          parent: category.parent,
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      if (
        dbError.code === 'P2002' &&
        (dbError.meta?.target as string[])?.includes('path')
      ) {
        return NextResponse.json(
          { error: `A category with path "${path}" already exists` },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('POST /api/categories failed:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
