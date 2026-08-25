// Shared constants + URL builders for the /listings faceted filtering system.

export interface FlatCategory {
  id: string;
  name: string;
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Jaunākie' },
  { value: 'oldest', label: 'Vecākie' },
  { value: 'price_asc', label: 'Cena: no zemākās' },
  { value: 'price_desc', label: 'Cena: no augstākās' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export const PRICE_RANGES = [
  { value: '', label: 'Jebkura cena', min: undefined, max: undefined },
  { value: '0-50', label: '0 – 50 €', min: 0, max: 50 },
  { value: '50-100', label: '50 – 100 €', min: 50, max: 100 },
  { value: '100-500', label: '100 – 500 €', min: 100, max: 500 },
  { value: '500-1000', label: '500 – 1 000 €', min: 500, max: 1000 },
  { value: '1000-', label: '1 000 €+', min: 1000, max: undefined },
] as const;

/** Canonical query params understood by /listings. */
export interface ListingsQuery {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number | string;
}

/**
 * Build a /listings URL from a partial query. Empty/default values are
 * omitted so URLs stay clean and shareable.
 */
export function buildListingsUrl(query: ListingsQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  if (query.minPrice) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice) params.set('maxPrice', String(query.maxPrice));
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  if (query.page && Number(query.page) > 1) params.set('page', String(query.page));
  const qs = params.toString();
  return qs ? `/listings?${qs}` : '/listings';
}

/** Derive a canonical price-range key ("min-max") from raw min/max params. */
export function priceRangeKey(minPrice?: string, maxPrice?: string): string {
  if (!minPrice && !maxPrice) return '';
  return `${minPrice ?? ''}-${maxPrice ?? ''}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('lv-LV', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}
