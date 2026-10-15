export const dynamic = "force-dynamic";

import { prisma } from "@/app/lib/prisma";
import CategoriesPageClient from "./categories-client";

interface RawSubChild {
  id: string;
  name: string;
  nameLv?: string | null;
  path?: unknown;
}

interface RawChild {
  id: string;
  name: string;
  nameLv?: string | null;
  nameRu?: string | null;
  nameEn?: string | null;
  nameUk?: string | null;
  path?: unknown;
  children?: RawSubChild[];
}

interface RawCategory {
  id: string;
  name: string;
  nameLv?: string | null;
  nameRu?: string | null;
  nameEn?: string | null;
  nameUk?: string | null;
  path?: unknown;
  children?: RawChild[];
}

export default async function CategoriesPage() {
  let categories: RawCategory[] = [];

  try {
    categories = (await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: {
        children: {
          orderBy: { name: "asc" },
          include: {
            children: {
              orderBy: { name: "asc" },
            },
          },
        },
      },
    })) as unknown as RawCategory[];
  } catch (err) {
    console.error("Categories fetch error:", err);
  }

  const formattedCategories = categories.map((c: RawCategory) => ({
    id: c.id,
    name: c.nameLv || c.name,
    nameRu: c.nameRu,
    nameEn: c.nameEn,
    nameUk: c.nameUk,
    slug: String(c.path || c.id),
    subcategories: (c.children || []).map((sub: RawChild) => ({
      id: sub.id,
      name: sub.nameLv || sub.name,
      nameRu: sub.nameRu,
      nameEn: sub.nameEn,
      nameUk: sub.nameUk,
      slug: String(sub.path || sub.id),
      items: (sub.children || []).map((leaf: RawSubChild) => ({
        id: leaf.id,
        name: leaf.nameLv || leaf.name,
        slug: String(leaf.path || leaf.id),
      })),
    })),
  }));

  return <CategoriesPageClient categories={formattedCategories} />;
}
