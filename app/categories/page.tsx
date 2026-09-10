export const dynamic = "force-dynamic";
import { prisma } from "@/app/lib/prisma";
import CategoriesPageClient from "./categories-client";

export default async function CategoriesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];

  try {
    categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
    });
  } catch {
    // DB not available
  }

  const categoriesForUI = categories.map((c) => ({
    id: c.id,
    name: c.nameLv || c.name,
    slug: String(c.path),
  }));

  return <CategoriesPageClient categories={categoriesForUI} />;
}
