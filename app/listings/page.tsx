export const dynamic = "force-dynamic";
import { prisma } from '@/app/lib/prisma';
import { Metadata } from 'next';
import { Prisma } from '@prisma/client';
import { ListingsPageClient } from './listings-client';

export const metadata: Metadata = {
  title: 'Sludinājumi',
  description: 'Pārlūkojiet visus sludinājumus SellBuy.lv — transports, nekustamie īpašumi, elektronika un vairāk.',
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    city?: string;
    page?: string;
  }>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q || '';
  const categorySlug = params.category || '';
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const sort = params.sort || 'newest';
  const city = params.city || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 12;

  // Build where clause
  const where: Prisma.ListingWhereInput = {};
  if (q) where.title = { contains: q, mode: 'insensitive' };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }
  if (city) where.city = city;
  if (categorySlug) {
    const category = await prisma.category.findFirst({ where: { name: categorySlug } });
    if (category) where.categoryId = category.id;
  }

  // Build orderBy
  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { name: true } }, author: { select: { id: true, name: true } } },
    }),
    prisma.listing.count({ where }),
  ]);

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const listingsForCard = listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: Number(l.price),
    images: l.images,
    city: l.city,
    categoryName: l.category?.name ?? '',
  }));

  return (
    <ListingsPageClient
      listings={listingsForCard}
      categories={categories}
      total={total}
      currentPage={page}
      totalPages={Math.ceil(total / pageSize)}
      currentFilters={{ q, category: categorySlug, minPrice: params.minPrice, maxPrice: params.maxPrice, sort, city }}
    />
  );
}
