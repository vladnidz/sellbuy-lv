export const dynamic = "force-dynamic";
import { Metadata } from 'next';
import { buildTrilingualMetadata, BRAND } from '@/app/lib/seo';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';
import { ListingsPageClient } from './listings-client';
import { getFtsListingWhere } from '@/app/lib/search';

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
  const q = params.q?.trim() || '';
  const categorySlug = params.category?.trim() || '';
  const city = params.city?.trim() || '';
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const page = parseInt(params.page || '1', 10);
  const pageSize = 12;

  const where: Prisma.ListingWhereInput = {};

  if (q) {
    const ftsWhere = await getFtsListingWhere(q);
    if (ftsWhere && Object.keys(ftsWhere).length > 0) {
      Object.assign(where, ftsWhere);
    }
  }

  if ((minPrice !== undefined && !isNaN(minPrice)) || (maxPrice !== undefined && !isNaN(maxPrice))) {
    where.price = {
      gte: minPrice !== undefined && !isNaN(minPrice) ? minPrice : undefined,
      lte: maxPrice !== undefined && !isNaN(maxPrice) ? maxPrice : undefined,
    };
  }

  if (city) {
    where.city = { contains: city, mode: 'insensitive' };
  }

  if (categorySlug) {
    let categoryIds: string[] = [];
    try {
      const isValidLtree = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(categorySlug);
      if (isValidLtree) {
        const matchingCategories = await prisma.$queryRaw<Array<{ id: string }>>(
          Prisma.sql`SELECT id FROM "Category" WHERE "path" @> ${categorySlug}::ltree`
        );
        categoryIds = matchingCategories.map((c) => c.id);
      }
    } catch {
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: categorySlug },
            { name: categorySlug }
          ]
        },
        select: { id: true }
      });
      if (category) categoryIds = [category.id];
    }

    if (categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    } else {
      where.categoryId = { in: ['__no_match__'] };
    }
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
  if (params.sort === 'price_asc' || params.sort === 'price-asc') {
    orderBy = { price: 'asc' };
  } else if (params.sort === 'price_desc' || params.sort === 'price-desc') {
    orderBy = { price: 'desc' };
  } else if (params.sort === 'oldest') {
    orderBy = { createdAt: 'asc' };
  }

  const [rawListings, total, rawCategories] = await Promise.all([
    prisma.listing.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
      orderBy,
      include: {
        category: true,
      },
    }),
    prisma.listing.count({ where }),
    prisma.category.findMany({
      select: { id: true, name: true, nameLv: true }
    })
  ]);

  const listings = rawListings.map((l) => ({
    id: l.id,
    title: l.title,
    price: Number(l.price),
    images: l.images,
    city: l.city,
    categoryName: l.category?.nameLv || l.category?.name || '',
  }));

  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.nameLv || c.name,
  }));

  const totalPages = Math.ceil(total / pageSize);

  return (
    <ListingsPageClient
      listings={listings}
      categories={categories}
      total={total}
      currentPage={page}
      totalPages={totalPages}
      currentFilters={{
        q,
        category: categorySlug,
        city,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        sort: params.sort,
      }}
    />
  );
}
