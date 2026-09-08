import fs from 'fs';
import path from 'path';

export type AttributeField = {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  label: Record<string, string>;
  options?: string[];
  required: boolean;
  operators: string[];
};

export function getTaxonomy() {
  const filePath = path.join(process.cwd(), 'SellBuy-lv-Category-Taxonomy.md');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const categories: Record<string, AttributeField[]> = {};
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
        
        let type: 'string' | 'number' | 'enum' | 'boolean' = 'string';
        let options: string[] | undefined = undefined;
        
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
