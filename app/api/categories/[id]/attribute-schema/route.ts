import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function parseTaxonomy(fileContent: string) {
  const categories: Record<string, any> = {};
  let currentCategory = '';

  fileContent.split('\n').forEach(line => {
    if (line.startsWith('## ')) {
      currentCategory = line.replace('## ', '').trim();
      categories[currentCategory] = [];
    } else if (line.startsWith('- ') && currentCategory) {
      const parts = line.replace('- ', '').split(':');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const typeInfo = parts.slice(1).join(':').trim();
        
        let type = 'string';
        let options = undefined;
        
        if (typeInfo.includes('enum')) {
          type = 'enum';
          const match = typeInfo.match(/\(([^)]+)\)/);
          if (match) {
            options = match[1].replace('options:', '').split(',').map(o => o.trim());
          }
        } else if (typeInfo.includes('number')) {
          type = 'number';
        }
        
        categories[currentCategory].push({
          name: name.toLowerCase(),
          type,
          label: { en: name },
          options,
          required: false,
          operators: type === 'enum' ? ['eq', 'neq', 'in'] : (type === 'number' ? ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'in'] : ['eq', 'neq', 'contains', 'in'])
        });
      }
    }
  });
  return categories;
}

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
      const rows: any[] = await prisma.$queryRaw`SELECT name FROM "Category" WHERE id = ${id}::uuid LIMIT 1`;
      if (rows.length > 0) categoryName = rows[0].name;
    } else {
      const rows: any[] = await prisma.$queryRaw`SELECT name FROM "Category" WHERE path = ${id}::ltree LIMIT 1`;
      if (rows.length > 0) categoryName = rows[0].name;
    }

    if (!categoryName) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Read and parse taxonomy
    const filePath = path.join(process.cwd(), 'SellBuy-lv-Category-Taxonomy.md');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const taxonomy = parseTaxonomy(fileContent);

    // Taxonomy uses Title Case for category names, e.g., "Cars"
    const taxonomyCategoryName = Object.keys(taxonomy).find(c => c.toLowerCase() === categoryName?.toLowerCase());
    
    const schema = taxonomyCategoryName ? taxonomy[taxonomyCategoryName] : [];

    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error fetching attribute schema:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
