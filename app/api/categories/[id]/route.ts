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

/**
 * Slugify a category name for use as an ltree label — mirrors POST /api/categories.
 */
function toLtreeLabel(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

type PatchBody = {
  name?: unknown;
  nameLv?: unknown;
  nameRu?: unknown;
  nameEn?: unknown;
  attributes?: unknown;
};

function validateLocalizedField(
  value: unknown,
  field: string
): string | true | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim().length === 0) {
    return `${field} must be a non-empty string`;
  }
  return true;
}

/**
 * PATCH /api/categories/[id]
 *
 * Updates `name` and/or localized names / attribute schema. Renaming
 * recomputes the category's ltree label (last segment) and rewrites the
 * subtree paths in one statement:
 *
 *   path = <newPath> || subltree(path, nlevel(<oldPath>), nlevel(path))
 *
 * applied to every row where `path <@ oldPath::ltree` — the category itself
 * gets exactly `<newPath>` while descendants keep their relative suffixes.
 * A resulting duplicate path raises 23505 → 409.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let body: PatchBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const hasAnyField =
      body.name !== undefined ||
      body.nameLv !== undefined ||
      body.nameRu !== undefined ||
      body.nameEn !== undefined ||
      body.attributes !== undefined;
    if (!hasAnyField) {
      return NextResponse.json(
        { error: 'At least one of name, nameLv, nameRu, nameEn, attributes is required' },
        { status: 400 }
      );
    }

    if (
      body.name !== undefined &&
      (typeof body.name !== 'string' ||
        body.name.trim().length === 0 ||
        body.name.length > 200)
    ) {
      return NextResponse.json(
        { error: 'name must be a non-empty string of at most 200 characters' },
        { status: 400 }
      );
    }

    for (const field of ['nameLv', 'nameRu', 'nameEn'] as const) {
      const result = validateLocalizedField(body[field], field);
      if (result !== undefined && result !== true) {
        return NextResponse.json({ error: result }, { status: 400 });
      }
    }

    if (
      body.attributes !== undefined &&
      (body.attributes === null || typeof body.attributes !== 'object' || Array.isArray(body.attributes))
    ) {
      return NextResponse.json(
        { error: 'attributes must be a JSON object' },
        { status: 400 }
      );
    }

    // Resolve by UUID or ltree path, same as GET.
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const current = (
      await prisma.$queryRaw<Array<{ id: string; path: string }>>`
        SELECT c.id, text(c.path) AS path
        FROM "Category" c
        WHERE ${isUuid ? Prisma.sql`c.id = ${id}` : Prisma.sql`c.path = ${id}::ltree`}
        LIMIT 1`
    )[0];

    if (!current) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const renaming = typeof body.name === 'string';
    let newPath: string | null = null;
    if (renaming) {
      const label = toLtreeLabel(body.name as string);
      if (!label) {
        return NextResponse.json(
          { error: 'name produces an empty ltree label' },
          { status: 400 }
        );
      }
      const lastDot = current.path.lastIndexOf('.');
      const parentPrefix = lastDot === -1 ? '' : `${current.path.slice(0, lastDot)}.`;
      newPath = `${parentPrefix}${label}`;
      if (newPath.length > 500) {
        return NextResponse.json(
          { error: 'computed path is too long' },
          { status: 400 }
        );
      }
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Scalar column updates via typed client (path excluded from its types).
        await tx.category.updateMany({
          where: { id: current.id },
          data: {
            ...(renaming ? { name: (body.name as string).trim() } : {}),
            ...(body.nameLv !== undefined ? { nameLv: (body.nameLv as string).trim() } : {}),
            ...(body.nameRu !== undefined ? { nameRu: (body.nameRu as string).trim() } : {}),
            ...(body.nameEn !== undefined ? { nameEn: (body.nameEn as string).trim() } : {}),
            ...(body.attributes !== undefined
              ? { attributes: body.attributes as Prisma.InputJsonValue }
              : {}),
          },
        });

        if (newPath) {
          // Rewrite our path and every descendant's suffix in one pass.
          await tx.$executeRaw`
            UPDATE "Category"
            SET path = ${newPath}::ltree
              || subltree(path, nlevel(${current.path}::ltree), nlevel(path))
            WHERE path <@ ${current.path}::ltree`;
        }
      });
    } catch (dbError: unknown) {
      const code = typeof dbError === 'object' && dbError !== null && 'code' in dbError
        ? String((dbError as { code?: unknown }).code)
        : undefined;
      const message = typeof dbError === 'object' && dbError !== null && 'message' in dbError
        ? String((dbError as { message?: unknown }).message)
        : '';
      if (
        code === 'P2002' ||
        code === '23505' ||
        String(message ?? '').includes('duplicate key')
      ) {
        return NextResponse.json(
          { error: `A category with path "${newPath}" already exists` },
          { status: 409 }
        );
      }
      throw dbError;
    }

    const updated = (
      await prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          nameLv: string | null;
          nameRu: string | null;
          nameEn: string | null;
          attributes: Prisma.JsonValue | null;
          path: string;
          parentId: string | null;
        }>
      >`
        SELECT c.id, c.name, c."nameLv", c."nameRu", c."nameEn",
               c.attributes, text(c.path) AS path, c."parentId"
        FROM "Category" c
        WHERE c.id = ${current.id}
        LIMIT 1`
    )[0];

    return NextResponse.json({
      data: {
        ...updated,
        attributes: updated.attributes ?? null,
        names: localize(updated),
      },
    });
  } catch (error) {
    console.error('PATCH /api/categories/[id] failed:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 *
 * Deletes the category and reassigns its direct children to the deleted
 * category's own parent (root categories orphan their children into roots).
 * Subtree paths of reassigned children are NOT rewritten — their ltree
 * labels remain historical; only the hierarchy edge moves.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const current = (
      await prisma.$queryRaw<Array<{ id: string; parentId: string | null }>>`
        SELECT c.id, c."parentId"
        FROM "Category" c
        WHERE ${isUuid ? Prisma.sql`c.id = ${id}` : Prisma.sql`c.path = ${id}::ltree`}
        LIMIT 1`
    )[0];

    if (!current) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const reassigned = await prisma.$transaction(async (tx) => {
      // Re-parent children first so the FK stays satisfied.
      const res = await tx.$executeRaw`
        UPDATE "Category"
        SET "parentId" = ${current.parentId}::text
        WHERE "parentId" = ${current.id}`;
      await tx.$executeRaw`
        DELETE FROM "Category"
        WHERE id = ${current.id}`;
      return res;
    });

    return NextResponse.json({
      data: { id: current.id, deleted: true, reassignedChildren: reassigned },
    });
  } catch (error) {
    console.error('DELETE /api/categories/[id] failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
