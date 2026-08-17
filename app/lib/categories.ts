import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add category with path management (using ltree path syntax e.g., '1.2.3')
export async function addCategory(name: string, parentPath: string | null = null) {
  const newPath = parentPath ? `${parentPath}.${name.toLowerCase().replace(/ /g, '_')}` : name.toLowerCase().replace(/ /g, '_');
  
  return await prisma.$executeRaw`
    INSERT INTO "Category" (name, path, "parentId")
    VALUES (${name}, ${newPath}::ltree, NULL);
  `;
}
