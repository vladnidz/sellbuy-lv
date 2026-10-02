export const dynamic = "force-dynamic";
import { Metadata } from 'next';
import { buildTrilingualMetadata, BRAND } from '@/app/lib/seo';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';
import { ListingsPageClient } from './listings-client';

export async function generateMetadata(): Promise<Metadata> {
  return buildTrilingualMetadata('/listings', {
    lv: { title: `Sludinājumi | ${BRAND}`, description: 'Pārlūkojiet visus sludinājumus SellBuy.lv — transports, nekustamie īpašumi, elektronika un vairāk.' },
    ru: { title: `Объявления | ${BRAND}`, description: 'Просматривайте все объявления на SellBuy.lv — транспорт, недвижимость, электроника и многое другое.' },
    en: { title: `Listings | ${BRAND}`, description: 'Browse all listings on SellBuy.lv — transport, real estate, electronics, and more.' },
  });
}

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
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }
  if (city) where.city = city;
  if (categorySlug) {
    try {
      // Validate ltree syntax: alphanumeric, underscores and hyphens separated by dots
      const isValidLtree = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(categorySlug);
      if (isValidLtree) {
        const matchingCategories = await prisma.$queryRaw<
          Array<{ id: string }>
        >`SELECT id FROM "Category" WHERE "path" @> ${categorySlug}::ltree`;
        const categoryIds = matchingCategories.map((c) => c.id);
        if (categoryIds.length > 0) {
          where.categoryId = { in: categoryIds };
        } else {
          where.categoryId = { in: ['__no_match__'] };
        }
      } else {
        const matched = await prisma.category.findFirst({
          where: {
            OR: [
              { id: categorySlug },
              { name: { equals: categorySlug, mode: 'insensitive' } },
              { path: { equals: categorySlug, mode: 'insensitive' } },
            ],
          },
        });
        if (matched) {
          where.categoryId = matched.id;
        } else {
          where.categoryId = '__no_match__';
        }
      }
    } catch {
      where.categoryId = '__no_match__';
    }
  }

  // Build orderBy
  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

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
