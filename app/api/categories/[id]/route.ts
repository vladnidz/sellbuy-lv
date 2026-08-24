import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

type CategoryRow = {
  id: string;
  name: string;
  nameLv: string | null;
  nameRu: string | null;
  nameEn: string | null;
  attributes: Prisma.JsonValue | null;
  path: string;
  parentId: string | null;
};

function localize(row: {
  name: string;
  nameLv: string | null;
  nameRu: string | null;
  nameEn: string | null;
}) {
  return {
    lv: row.nameLv ?? row.name,
    ru: row.nameRu ?? row.name,
    en: row.nameEn ?? row.name,
  };
}

/**
 * GET /api/categories/[id]
 *
 * `id` may be a category UUID or an ltree path (e.g. "electronics.phones").
 * Returns the category with trilingual names, its JSONB attribute schema,
 * plus ancestor chain and direct children.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const rows: CategoryRow[] = isUuid
      ? await prisma.$queryRaw<CategoryRow[]>`
          SELECT c.id, c.name, c."nameLv", c."nameRu", c."nameEn",
                 c.attributes, text(c.path) AS path, c."parentId"
          FROM "Category" c
          WHERE c.id = ${id}
          LIMIT 1`
      : await prisma.$queryRaw<CategoryRow[]>`
          SELECT c.id, c.name, c."nameLv", c."nameRu", c."nameEn",
                 c.attributes, text(c.path) AS path, c."parentId"
          FROM "Category" c
          WHERE c.path = ${id}::ltree
          LIMIT 1`;

    const category = rows[0];
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Ancestors via the ltree GiST index: any category whose path contains ours.
    const ancestors: CategoryRow[] = await prisma.$queryRaw<CategoryRow[]>`
      SELECT a.id, a.name, a."nameLv", a."nameRu", a."nameEn",
             a.attributes, text(a.path) AS path, a."parentId"
      FROM "Category" a
      WHERE a.path @> ${category.path}::ltree AND a.id <> ${category.id}
      ORDER BY nlevel(a.path)`;

    const children: CategoryRow[] = await prisma.$queryRaw<CategoryRow[]>`
      SELECT ch.id, ch.name, ch."nameLv", ch."nameRu", ch."nameEn",
             ch.attributes, text(ch.path) AS path, ch."parentId"
      FROM "Category" ch
      WHERE ch."parentId" = ${category.id}
      ORDER BY ch.name`;

    return NextResponse.json({
      data: {
        ...category,
        attributes: category.attributes ?? null,
        names: localize(category),
        ancestors: ancestors.map((a) => ({
          id: a.id,
          path: a.path,
          names: localize(a),
        })),
        children: children.map((c) => ({
          id: c.id,
          path: c.path,
          attributes: c.attributes ?? null,
          names: localize(c),
        })),
      },
    });
  } catch (error) {
    console.error('GET /api/categories/[id] failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
