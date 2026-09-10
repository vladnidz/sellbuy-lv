export const dynamic = 'force-dynamic';

import { prisma } from '@/app/lib/prisma';
import { HomePageContent } from '@/app/home-content';

export default async function Home() {
  let listings: { id: string; title: string; price: unknown; images: string[]; city: string | null; category: { name: string } | null }[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];

  try {
    [listings, categories] = await Promise.all([
      prisma.listing.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { category: { select: { name: true } } },
      }),
      prisma.category.findMany({
        where: { parentId: null },
        orderBy: { name: 'asc' },
      }),
    ]);
  } catch {
    // DB not available
  }

  const listingsForCard = listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: Number(l.price),
    images: l.images,
    city: l.city,
    categoryName: l.category?.name ?? '',
  }));

  const categoriesForUI = categories.map((c) => ({
    id: c.id,
    name: c.nameLv || c.name,
    slug: String(c.path),
  }));

  return <HomePageContent listings={listingsForCard} categories={categoriesForUI} />;
}
