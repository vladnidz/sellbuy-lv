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

export type TreeCategoryNode = {
  id: string;
  path: string;
  attributes: Prisma.JsonValue | null;
  names: { lv: string; ru: string; en: string };
  children: TreeCategoryNode[];
};

function localize(row: {
  name: string;
  nameLv: string | null;
  nameRu: string | null;
  nameEn: string | null;
}): TreeCategoryNode['names'] {
  return {
    lv: row.nameLv ?? row.name,
    ru: row.nameRu ?? row.name,
    en: row.nameEn ?? row.name,
  };
}

/**
 * GET /api/categories/tree
 *
 * Returns the full category hierarchy as a nested tree. A single ordered
 * ltree query (ordered by `path`, leveraging the GiST index) is fetched and
 * assembled in memory — no recursive CTE needed.
 *
 * Query params:
 *   root=<ltree path> — return only the subtree rooted at the given path
 *                       (inclusive), using `path <@ root::ltree`.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const root = searchParams.get('root');

    const rows: CategoryRow[] = root
      ? await prisma.$queryRaw<CategoryRow[]>`
          SELECT c.id, c.name, c."nameLv", c."nameRu", c."nameEn",
                 c.attributes, text(c.path) AS path, c."parentId"
          FROM "Category" c
          WHERE c.path <@ ${root}::ltree
          ORDER BY c.path`
      : await prisma.$queryRaw<CategoryRow[]>`
          SELECT c.id, c.name, c."nameLv", c."nameRu", c."nameEn",
                 c.attributes, text(c.path) AS path, c."parentId"
          FROM "Category" c
          ORDER BY c.path`;

    const nodes = new Map<string, TreeCategoryNode>();
    for (const row of rows) {
      nodes.set(row.id, {
        id: row.id,
        path: row.path,
        attributes: row.attributes ?? null,
        names: localize(row),
        children: [],
      });
    }

    const tree: TreeCategoryNode[] = [];
    for (const row of rows) {
      const node = nodes.get(row.id)!;
      // Ordered by path, so a parent is always inserted before its children.
      const parent = row.parentId ? nodes.get(row.parentId) : undefined;
      if (parent && parent !== node) {
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    }

    return NextResponse.json({ count: rows.length, data: tree });
  } catch (error) {
    console.error('GET /api/categories/tree failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category tree' },
      { status: 500 }
    );
  }
}
