import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
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

      // `path` is an Unsupported ltree column, so we must read it via raw
      // SQL — Prisma Client's typed select omits Unsupported fields.
      const parents = await prisma.$queryRaw<
        Array<{ id: string; path: string }>
      >`SELECT id, text(path) AS "path" FROM "Category" WHERE id = ${body.parentId}`;
      const parent = parents[0];
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
      // Prisma Client does not generate `create` for models with a required
      // Unsupported column (ltree `path`), so insert via raw SQL.
      const newId = randomUUID();
      const nameLv = (body.nameLv as string | undefined)?.trim() || null;
      const nameRu = (body.nameRu as string | undefined)?.trim() || null;
      const nameEn = (body.nameEn as string | undefined)?.trim() || null;
      const attributes =
        body.attributes === undefined ? null : JSON.stringify(body.attributes);

      await prisma.$executeRaw`
        INSERT INTO "Category"
          ("id", "name", "nameLv", "nameRu", "nameEn", "attributes", "parentId", "path")
        VALUES (
          ${newId}::text,
          ${body.name.trim()}::text,
          ${nameLv}::text,
          ${nameRu}::text,
          ${nameEn}::text,
          ${attributes}::jsonb,
          ${resolvedParentId}::text,
          ${path}::ltree
        )`;

      // Fetch the created row plus parent info for the response.
      const inserted = await prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          nameLv: string | null;
          nameRu: string | null;
          nameEn: string | null;
          attributes: Prisma.JsonValue | null;
          parentId: string | null;
          parentName?: string | null;
        }>
      >`
        SELECT c.id, c.name, c."nameLv", c."nameRu", c."nameEn", c.attributes,
               c."parentId", p.name AS "parentName"
        FROM "Category" c
        LEFT JOIN "Category" p ON p.id = c."parentId"
        WHERE c.id = ${newId}`;
      const category = inserted[0];

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
          parent:
            category.parentId && category.parentName
              ? { id: category.parentId, name: category.parentName }
              : null,
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      // Raw SQL raises the Postgres unique-violation code 23505 (typed client
      // would surface P2002) — handle both so duplicates still map to 409.
      if (
        dbError.code === 'P2002' ||
        dbError.code === '23505' ||
        String(dbError.message ?? '').includes('duplicate key')
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
