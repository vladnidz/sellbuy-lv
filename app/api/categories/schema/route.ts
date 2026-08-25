import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Filter operators supported per attribute field type.
 *
 * Derived from the seed-data attribute contract (prisma/seed.ts) and the
 * Category model's JSONB `attributes` column in prisma/schema.prisma:
 *
 *   field: {
 *     type: 'string' | 'number' | 'enum' | 'boolean',
 *     label: { lv, ru, en },
 *     options?: string[],   // for enums
 *     required?: boolean,
 *   }
 */
const OPERATORS_BY_TYPE: Record<string, string[]> = {
  string: ['eq', 'neq', 'contains', 'in'],
  number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'in'],
  enum: ['eq', 'neq', 'in'],
  boolean: ['eq'],
};

type AttributeField = {
  type?: unknown;
  label?: unknown;
  options?: unknown;
  required?: unknown;
};

type SchemaField = {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  label: Record<string, string>;
  options?: string[];
  required: boolean;
  operators: string[];
};

type CategoryRow = {
  id: string;
  path: string;
  name: string;
  nameLv: string | null;
  nameRu: string | null;
  nameEn: string | null;
  parentId: string | null;
  attributes: Prisma.JsonValue | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Normalize a raw JSONB `attributes` value into the filterable-schema shape.
 * Unknown/malformed entries are skipped rather than throwing, so one bad
 * category can never take down the whole endpoint.
 */
function toSchemaFields(attributes: Prisma.JsonValue | null): SchemaField[] {
  if (attributes === null || typeof attributes !== 'object') return [];

  const fields: SchemaField[] = [];
  for (const [name, raw] of Object.entries(
    attributes as Record<string, unknown>
  )) {
    const field = raw as AttributeField;
    const type = field?.type;
    if (
      type !== 'string' &&
      type !== 'number' &&
      type !== 'enum' &&
      type !== 'boolean'
    ) {
      continue;
    }

    const label =
      field.label && typeof field.label === 'object'
        ? (field.label as Record<string, string>)
        : {};

    fields.push({
      name,
      type,
      label,
      ...(type === 'enum' && Array.isArray(field.options)
        ? { options: field.options.filter((o): o is string => typeof o === 'string') }
        : {}),
      required: field.required === true,
      operators: OPERATORS_BY_TYPE[type],
    });
  }
  return fields;
}

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
 * GET /api/categories/schema?categoryId=...
 *
 * Returns the filterable-attribute schema for categories:
 *
 *   { categories: [ { id, path, name: {lv,ru,en}, parentId, fields: [
 *       { name, type, label, options?, required, operators } ] } ] }
 *
 * `categoryId` may be a category UUID or an ltree path (e.g.
 * "transport.cars"); when omitted, schemas for every category are returned
 * ordered by ltree path.
 *
 * Derived from prisma/schema.prisma (Category.attributes JSONB) + seed data,
 * since SellBuy-lv-Category-Taxonomy.md is not present in this repo.
 */
export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get('categoryId');

    let rows: CategoryRow[];
    if (!categoryId) {
      rows = await prisma.$queryRaw<CategoryRow[]>`
        SELECT c.id, text(c.path) AS path, c.name, c."nameLv", c."nameRu",
               c."nameEn", c."parentId", c.attributes
        FROM "Category" c
        ORDER BY c.path`;
    } else if (UUID_RE.test(categoryId)) {
      rows = await prisma.$queryRaw<CategoryRow[]>`
        SELECT c.id, text(c.path) AS path, c.name, c."nameLv", c."nameRu",
               c."nameEn", c."parentId", c.attributes
        FROM "Category" c
        WHERE c.id = ${categoryId}
        LIMIT 1`;
    } else {
      // ltree path — include descendants so clients get filterable fields for
      // the whole subtree under a parent category.
      rows = await prisma.$queryRaw<CategoryRow[]>`
        SELECT c.id, text(c.path) AS path, c.name, c."nameLv", c."nameRu",
               c."nameEn", c."parentId", c.attributes
        FROM "Category" c
        WHERE c.path = ${categoryId}::ltree
           OR c.path <@ ${categoryId}::ltree
        ORDER BY c.path`;
    }

    if (categoryId && rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      categories: rows.map((row) => ({
        id: row.id,
        path: row.path,
        name: localize(row),
        parentId: row.parentId,
        fields: toSchemaFields(row.attributes),
      })),
    });
  } catch (error) {
    console.error('GET /api/categories/schema failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
