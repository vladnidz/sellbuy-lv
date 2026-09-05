import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = path.join(process.cwd(), 'SellBuy-lv-Category-Taxonomy.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Very simple parser for the markdown
  const categories: Record<string, any> = {};
  let currentCategory = '';
  
  fileContent.split('\n').forEach(line => {
    if (line.startsWith('## ')) {
      currentCategory = line.replace('## ', '').trim();
      categories[currentCategory] = [];
    } else if (line.startsWith('- ')) {
      const parts = line.replace('- ', '').split(':');
      if (parts.length === 2) {
        const name = parts[0].trim();
        const typeInfo = parts[1].trim();
        
        let type = 'string';
        let options = undefined;
        
        if (typeInfo.includes('enum')) {
          type = 'enum';
          const match = typeInfo.match(/\(([^)]+)\)/);
          if (match) {
            options = match[1].split(',').map(o => o.trim());
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

  return NextResponse.json(categories);
}
