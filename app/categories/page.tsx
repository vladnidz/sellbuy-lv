export const dynamic = "force-dynamic";
import { prisma } from '../lib/prisma';

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Kategorijas</h1>
      <ul className="grid grid-cols-2 gap-4">
        {categories.map((cat: Category) => (
          <li key={cat.id} className="p-4 border rounded shadow">
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
