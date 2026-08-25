export const dynamic = "force-dynamic";
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

interface AttributeField {
  type?: unknown;
  label?: unknown;
  options?: unknown;
  required?: unknown;
}

interface NormalizedAttrField {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  label: string;
  options: string[];
}

/** Latvian city/district options for the location filter. */
const CITIES = [
  'Rīga', 'Daugavpils', 'Jelgava', 'Jūrmala', 'Liepāja', 'Rēzekne',
  'Valmiera', 'Ventspils', 'Ogre', 'Jēkabpils', 'Tukums', 'Salaspils',
];

interface CategoryWithPath {
  id: string;
  name: string;
  path?: string | null;
  parentId: string | null;
  attributes?: Prisma.JsonValue | null;
}

interface ListingWithRelations {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  createdAt: Date;
  city?: string | null;
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
    city?: string;
    [key: `attr_${string}`]: string | undefined;
    [key: `attrmin_${string}`]: string | undefined;
    [key: `attrmax_${string}`]: string | undefined;
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
    select: {
      id: true,
      name: true,
      parentId: true,
      attributes: true,
    },
  });
}

/**
 * Normalize a category's raw JSONB `attributes` schema into filterable fields.
 * Malformed entries are skipped defensively, mirroring the /api/categories/schema
 * endpoint's contract.
 */
function normalizeAttrFields(attributes: Prisma.JsonValue | null): NormalizedAttrField[] {
  if (attributes === null || typeof attributes !== 'object') return [];
  return Object.entries(attributes as Record<string, unknown>)
    .filter((entry): entry is [string, AttributeField] => {
      const v = entry[1];
      return v !== null && typeof v === 'object';
    })
    .map(([name, field]) => {
      const type = ['string', 'number', 'enum', 'boolean'].includes(String(field.type))
        ? (String(field.type) as NormalizedAttrField['type'])
        : 'string';
      const label =
        field.label && typeof field.label === 'object'
          ? String((field.label as Record<string, unknown>).lv ?? name)
          : name;
      const options = Array.isArray(field.options)
        ? field.options.map((o) => String(o))
        : [];
      return { name, type, label, options };
    });
}

/** Collect attr_* equality and numeric-range filters from resolved search params. */
function parseAttrParams(resolved: Record<string, string | undefined>) {
  const eq: Record<string, string> = {};
  const range: Record<string, { min?: number; max?: number }> = {};
  for (const [key, value] of Object.entries(resolved)) {
    if (!value) continue;
    if (key.startsWith('attr_')) {
      eq[key.slice(5)] = value;
    } else if (key.startsWith('attrmin_')) {
      const name = key.slice(8);
      const n = parseFloat(value);
      if (!Number.isNaN(n)) (range[name] ??= {}).min = n;
    } else if (key.startsWith('attrmax_')) {
      const name = key.slice(8);
      const n = parseFloat(value);
      if (!Number.isNaN(n)) (range[name] ??= {}).max = n;
    }
  }
  return { eq, range };
}

/**
 * Resolve Listing ids matching JSONB attribute predicates via parameterized SQL
 * (Prisma's Json filter does not support numeric gte/lte). Returns null when no
 * attribute filters are present so callers can skip the query entirely.
 */
async function getAttrMatchingIds(
  eq: Record<string, string>,
  range: Record<string, { min?: number; max?: number }>
): Promise<string[] | null> {
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  for (const [name, value] of Object.entries(eq)) {
    values.push(name);
    const idx = values.length;
    // Boolean/numeric-looking values are compared as jsonb, everything else as text.
    if (value === 'true' || value === 'false') {
      conditions.push(`("attributes" ->> $${idx})::boolean = ${value}`);
    } else if (value !== '' && !Number.isNaN(Number(value))) {
      conditions.push(`("attributes" ->> $${idx})::numeric = ${Number(value)}`);
    } else {
      conditions.push(`"attributes" ->> $${idx} = '${value.replace(/'/g, "''")}'`);
    }
  }

  for (const [name, { min, max }] of Object.entries(range)) {
    values.push(name);
    const idx = values.length;
    const guard = `("attributes" ? $${idx} AND ("attributes" ->> $${idx}) ~ '^-?[0-9]+(\\.[0-9]+)?$')`;
    if (min !== undefined) conditions.push(`${guard} AND ("attributes" ->> $${idx})::numeric >= ${min}`);
    if (max !== undefined) conditions.push(`${guard} AND ("attributes" ->> $${idx})::numeric <= ${max}`);
  }

  if (conditions.length === 0) return null;

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT id FROM "Listing" WHERE ${Prisma.raw(conditions.join(' AND '))}`,
    ...values
  );
  return rows.map((r) => r.id);
}

async function getListings(params: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  city?: string;
  attrEq?: Record<string, string>;
  attrRange?: Record<string, { min?: number; max?: number }>;
}) {
  const { q, category, minPrice, maxPrice, sort = 'newest', page = 1, limit = 12, city, attrEq, attrRange } = params;

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

  if (city) {
    where.city = { equals: city, mode: 'insensitive' };
  }

  // JSONB attribute facet filters (attr_<name>=..., attrmin_/attrmax_).
  const attrIds = await getAttrMatchingIds(attrEq ?? {}, attrRange ?? {});
  if (attrIds !== null) {
    where.id = attrIds.length > 0 ? { in: attrIds } : { in: ['__no_match__'] };
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
  const city = resolvedParams.city || '';
  const { eq: attrEq, range: attrRange } = parseAttrParams(resolvedParams);

  const [categories, { listings, pagination }] = await Promise.all([
    getCategories(),
    getListings({ q, category, minPrice, maxPrice, sort, page, limit, city, attrEq, attrRange }),
  ]);

  // Merge attribute schemas from the selected category's ancestor chain
  // (nearest category wins), so e.g. "Automobīli" inherits "Transports.make".
  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const mergedAttrs: Record<string, unknown> = {};
  if (category) {
    const chain: CategoryWithPath[] = [];
    let cursor: CategoryWithPath | undefined = categoriesById.get(category);
    while (cursor) {
      chain.unshift(cursor);
      cursor = cursor.parentId ? categoriesById.get(cursor.parentId) : undefined;
    }
    for (const node of chain) {
      if (node.attributes && typeof node.attributes === 'object') {
        Object.assign(mergedAttrs, node.attributes as Record<string, unknown>);
      }
    }
  }
  const attrFields = normalizeAttrFields(JSON.parse(JSON.stringify(mergedAttrs)) as Prisma.JsonValue);

  // URL with all attribute facet params removed (for the "Notīrīt" link).
  const buildUrl = (params: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'newest') {
        searchParams.set(key, String(value));
      }
    });
    return `/listings?${searchParams.toString()}`;
  };

  const clearAttrUrl = buildUrl(
    Object.fromEntries(
      Object.entries(resolvedParams)
        .filter(([k]) => !k.startsWith('attr_'))
        .concat([['page', '1']])
    )
  );

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('lv-LV', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(price));
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Pilsēta / novads</label>
            <Select
              value={city}
              onValueChange={(value) => {
                window.location.href = buildUrl({ ...resolvedParams, city: value || undefined, page: 1 });
              }}
            >
              <SelectTrigger className="bg-slate-900/60 border-slate-700 backdrop-blur-sm transition-colors focus:border-blue-500/60">
                <SelectValue placeholder="Visa Latvija" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-slate-700">
                <SelectItem value="">Visa Latvija</SelectItem>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
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

        {/* Category Attribute Facets */}
        {attrFields.length > 0 && (
          <div className="mb-8 p-5 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 transition-colors hover:border-slate-600/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Kategorijas parametri
              </h3>
              <Link
                href={clearAttrUrl}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Notīrīt
              </Link>
            </div>
            <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Preserve non-attribute filters across form submits */}
              {q && <input type="hidden" name="q" value={q} />}
              {category && <input type="hidden" name="category" value={category} />}
              {resolvedParams.minPrice && <input type="hidden" name="minPrice" value={resolvedParams.minPrice} />}
              {resolvedParams.maxPrice && <input type="hidden" name="maxPrice" value={resolvedParams.maxPrice} />}
              {city && <input type="hidden" name="city" value={city} />}
              {sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}

              {attrFields.map((field) => {
                const current = attrEq[field.name] ?? '';
                const min = resolvedParams[`attrmin_${field.name}`] ?? '';
                const max = resolvedParams[`attrmax_${field.name}`] ?? '';
                return (
                  <div key={field.name}>
                    <label htmlFor={`attr-${field.name}`} className="block text-sm font-medium text-slate-300 mb-2">
                      {field.label}
                    </label>
                    {(field.type === 'enum' || field.type === 'boolean') ? (
                      <select
                        id={`attr-${field.name}`}
                        name={`attr_${field.name}`}
                        defaultValue={current}
                        className="w-full h-10 rounded-md border border-slate-700 bg-slate-900/60 px-3 text-sm text-white backdrop-blur-sm transition-colors focus:border-blue-500/60 focus:outline-none"
                      >
                        <option value="">Visi</option>
                        {field.type === 'boolean'
                          ? [
                              { value: 'true', label: 'Jā' },
                              { value: 'false', label: 'Nē' },
                            ].map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))
                          : field.options.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                      </select>
                    ) : field.type === 'number' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          id={`attr-${field.name}-min`}
                          name={`attrmin_${field.name}`}
                          type="number"
                          inputMode="numeric"
                          placeholder="no"
                          defaultValue={min}
                          className="bg-slate-900/60 border-slate-700 h-10 backdrop-blur-sm transition-colors focus:border-blue-500/60"
                        />
                        <span className="text-slate-500">–</span>
                        <Input
                          id={`attr-${field.name}-max`}
                          name={`attrmax_${field.name}`}
                          type="number"
                          inputMode="numeric"
                          placeholder="līdz"
                          defaultValue={max}
                          className="bg-slate-900/60 border-slate-700 h-10 backdrop-blur-sm transition-colors focus:border-blue-500/60"
                        />
                      </div>
                    ) : (
                      <Input
                        id={`attr-${field.name}`}
                        name={`attr_${field.name}`}
                        defaultValue={current}
                        placeholder={`${field.label}...`}
                        className="bg-slate-900/60 border-slate-700 h-10 backdrop-blur-sm transition-colors focus:border-blue-500/60"
                      />
                    )}
                  </div>
                );
              })}

              <div className="flex items-end sm:col-span-2 lg:col-span-4">
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 transition-colors">
                  Piemērot filtrus
                </Button>
              </div>
            </form>
          </div>
        )}

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
                          {listing.city && (
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
                              {listing.city}
                            </Badge>
                          )}
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