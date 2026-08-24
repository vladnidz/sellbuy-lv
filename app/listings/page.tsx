import { prisma } from '@/app/lib/prisma';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Truck, Shield } from 'lucide-react';
import { Metadata } from 'next';
import { Prisma } from '@prisma/client';

interface CategoryWithPath {
  id: string;
  name: string;
  path: string | null;
  parentId: string | null;
}

interface ListingWithRelations {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  createdAt: Date;
  category: CategoryWithPath | null;
  author: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface ListingsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    priceRange?: string;
  }>;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Jaunākie' },
  { value: 'oldest', label: 'Vecākie' },
  { value: 'price_asc', label: 'Cena: no zēmākās' },
  { value: 'price_desc', label: 'Cena: no augstākās' },
];

const PRICE_RANGES = [
  { value: '', label: 'Jebkura cena' },
  { value: '0-50', label: '0 - 50 EUR' },
  { value: '50-100', label: '50 - 100 EUR' },
  { value: '100-500', label: '100 - 500 EUR' },
  { value: '500-1000', label: '500 - 1000 EUR' },
  { value: '1000-', label: '1000+ EUR' },
];

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

async function getListings(params: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const { q, category, minPrice, maxPrice, sort = 'newest', page = 1, limit = 12 } = params;

  const where: Prisma.ListingWhereInput = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (category) {
    const matchingCategories = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Category" WHERE "path" @> (
        SELECT path FROM "Category" WHERE id = ${category}
      )::ltree
    `;
    const categoryIds = matchingCategories.map(c => c.id);
    if (categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    } else {
      where.categoryId = { in: ['__no_match__'] };
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'oldest') orderBy = { createdAt: 'asc' };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            parentId: true,
          },
        },
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    listings: listings as unknown as ListingWithRelations[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export const metadata: Metadata = {
  title: 'Visi sludinājumi | SellBuy.lv',
  description: 'Meklē un atrod labākos sludinājumus Latvijā. Transports, nekustamie īpašumi, elektronika un daudz kas cits.',
};

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const category = resolvedParams.category || '';
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined;
  const sort = resolvedParams.sort || 'newest';
  const page = parseInt(resolvedParams.page || '1');
  const limit = 12;

  const [categories, { listings, pagination }] = await Promise.all([
    getCategories(),
    getListings({ q, category, minPrice, maxPrice, sort, page, limit }),
  ]);

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('lv-LV', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(price));
  };

  const buildUrl = (params: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'newest') {
        searchParams.set(key, String(value));
      }
    });
    return `/listings?${searchParams.toString()}`;
  };

  const handlePriceRangeChange = (range: string) => {
    if (!range) {
      return buildUrl({ ...resolvedParams, minPrice: undefined, maxPrice: undefined, page: 1 });
    }
    const [min, max] = range.split('-');
    const newParams: Record<string, string | number | undefined> = { ...resolvedParams, page: 1 };
    if (min && min !== '0') newParams.minPrice = min;
    if (max && max !== '-') newParams.maxPrice = max;
    return buildUrl(newParams);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              SellBuy.lv
            </Link>
            <div className="flex gap-3">
              <Link href="/new-listing">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Pievienot Sludinājumu</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search & Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Atpakaļ uz sākumlapu
        </Link>

        {/* Search Bar */}
        <div className="mb-8">
          <form className="flex flex-col sm:flex-row gap-4" method="GET">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                name="q"
                placeholder="Meklēt sludinājumus..."
                value={q}
                className="pl-10 bg-slate-900/50 border-slate-700 h-12 text-lg"
              />
            </div>
            <Button type="submit" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
              <Search className="h-4 w-4 mr-2" />
              Meklēt
            </Button>
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-slate-900/30 border border-slate-800 rounded-xl">
          <div className="flex-1">
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
              Kategorija
            </label>
            <Select
              value={category}
              onValueChange={(value) => {
                // eslint-disable-next-line react-hooks/immutability
                window.location.href = buildUrl({ ...resolvedParams, category: value || undefined, page: 1 });
              }}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue placeholder="Visas kategorijas" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="">Visas kategorijas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label htmlFor="priceRange" className="block text-sm font-medium text-slate-300 mb-2">
              Cenas diapazons
            </label>
            <Select
              value={resolvedParams.priceRange || ''}
              onValueChange={(value) => {
                // eslint-disable-next-line react-hooks/immutability
                window.location.href = handlePriceRangeChange(value);
              }}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue placeholder="Jebkura cena" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {PRICE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label htmlFor="sort" className="block text-sm font-medium text-slate-300 mb-2">
              Kārtot
            </label>
            <Select
              value={sort}
              onValueChange={(value) => {
                window.location.href = buildUrl({ ...resolvedParams, sort: value, page: 1 });
              }}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-300">
            Atrasts {pagination.total} sludinājumu{pagination.total !== 1 ? 'i' : ''}
          </p>
        </div>

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {listings.map((listing) => {
                const images = listing.images && listing.images.length > 0 ? listing.images : [];
                const mainImage = images[0] || null;

                return (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <Card className="group bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer h-full flex flex-col">
                      {/* Image */}
                      <div className="aspect-square relative overflow-hidden rounded-t-xl bg-slate-800">
                        {mainImage ? (
                          <Image
                            src={mainImage}
                            alt={listing.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                            📦
                          </div>
                        )}
                        {images.length > 1 && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-black/70 text-white border-none">
                              +{images.length - 1}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="flex-1 flex flex-col p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-blue-950 text-blue-300 border-blue-800 text-xs">
                            {listing.category?.name || 'Kategorija'}
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                          {listing.title}
                        </h3>

                        <div className="text-2xl font-bold text-blue-400 mt-auto mb-3">
                          {formatPrice(listing.price)}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-800 pt-3">
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-green-400" />
                            {listing.author?.name ? 'Verificēts' : 'Anonīms'}
                          </span>
                          <span className="flex items-center gap-1 ml-auto">
                            <Truck className="h-3 w-3" />
                            Piegāde
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 && (
                  <Link
                    href={buildUrl({ ...resolvedParams, page: page - 1 })}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Atpakaļ
                  </Link>
                )}

                <div className="flex items-center gap-1 mx-4">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Link
                        key={pageNum}
                        href={buildUrl({ ...resolvedParams, page: pageNum })}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {page < pagination.totalPages && (
                  <Link
                    href={buildUrl({ ...resolvedParams, page: page + 1 })}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    Nākamā
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <Card className="bg-slate-900/50 border-slate-800 py-20 text-center">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">Sludinājumi nav atrasti</h3>
              <p className="text-slate-400 mb-6">
                {q ? `Nav sludinājumu, kas atbilst meklējumam "${q}"` : 'Šajā kategorijā vēl nav sludinājumu'}
              </p>
              <Link href="/new-listing">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Būt pirmājam, kurš publicē sludinājumu
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Trust Footer */}
        <Card className="mt-12 bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border-blue-900/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">Smart-ID</div>
                <div className="text-sm text-slate-300">Verificēti lietotāji</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">Escrow</div>
                <div className="text-sm text-slate-300">Droši darījumi</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">Omniva/DPD</div>
                <div className="text-sm text-slate-300">Ātra piegāde</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          © 2026 SellBuy.lv — Viss Jūsu darījumiem
        </div>
      </footer>
    </div>
  );
}