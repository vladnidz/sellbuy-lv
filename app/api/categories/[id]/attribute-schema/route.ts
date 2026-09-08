import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getTaxonomy } from '@/app/lib/taxonomy';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Find category name by ID or path
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let categoryName: string | null = null;
    
    if (isUuid) {
      const rows: unknown[] = await prisma.$queryRaw`SELECT name FROM "Category" WHERE id = ${id}::uuid LIMIT 1`;
      if (rows.length > 0) categoryName = (rows[0] as { name: string }).name;
    } else {
      const rows: unknown[] = await prisma.$queryRaw`SELECT name FROM "Category" WHERE path = ${id}::ltree LIMIT 1`;
      if (rows.length > 0) categoryName = (rows[0] as { name: string }).name;
    }

    if (!categoryName) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const taxonomy = getTaxonomy();

    // Taxonomy uses Title Case for category names, e.g., "Cars"
    const taxonomyCategoryName = Object.keys(taxonomy).find(c => c.toLowerCase() === categoryName?.toLowerCase());
    
    const schema = taxonomyCategoryName ? taxonomy[taxonomyCategoryName] : [];

    // Return as a structured JSONB filter schema
    return NextResponse.json({
        category: taxonomyCategoryName || categoryName,
        schema: schema
    });
  } catch (error) {
    console.error('Error fetching attribute schema:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
