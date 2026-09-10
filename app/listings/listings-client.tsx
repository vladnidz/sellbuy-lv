'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import { useLocale } from '@/app/lib/locale-context';

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  city: string | null;
  categoryName: string;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  listings: Listing[];
  categories: Category[];
  total: number;
  currentPage: number;
  totalPages: number;
  currentFilters: {
    q?: string;
    category?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
}

export function ListingsPageClient({ listings, categories, total, currentPage, totalPages, currentFilters }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentFilters.q || '');
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLocale();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (currentFilters.category) params.set('category', currentFilters.category);
    router.push(`/listings?${params.toString()}`);
  }

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = { ...currentFilters, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    return `/listings?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('listings.title')}</h1>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center border rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('listings.search_placeholder')}
              className="bg-transparent px-3 py-2 text-sm outline-none w-40" style={{ color: 'var(--text-primary)' }} />
            <button type="submit" className="px-3 py-2" style={{ color: 'var(--text-tertiary)' }}><Search className="h-4 w-4" /></button>
          </form>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-sm border rounded-lg px-3 py-2 transition-colors"
            style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
            <SlidersHorizontal className="h-4 w-4" />
            {t('listings.filters')}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="border rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('listings.category')}</label>
            <select value={currentFilters.category || ''} onChange={(e) => router.push(buildUrl({ category: e.target.value, page: '1' }))}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <option value="">{t('listings.category')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('listings.sort_newest')}</label>
            <select value={currentFilters.sort || 'newest'} onChange={(e) => router.push(buildUrl({ sort: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <option value="newest">{t('listings.sort_newest')}</option>
              <option value="price_asc">{t('listings.sort_price_asc')}</option>
              <option value="price_desc">{t('listings.sort_price_desc')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('listings.price_from')}</label>
            <input type="number" placeholder="€" defaultValue={currentFilters.minPrice || ''}
              onBlur={(e) => router.push(buildUrl({ minPrice: e.target.value, page: '1' }))}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{t('listings.price_to')}</label>
            <input type="number" placeholder="€" defaultValue={currentFilters.maxPrice || ''}
              onBlur={(e) => router.push(buildUrl({ maxPrice: e.target.value, page: '1' }))}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
        </div>
      )}

      <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>{total} {t('listings.results')}</p>

      {listings.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>{t('listings.empty_state')}</p>
          <Link href="/listings" className="text-sm mt-3 inline-block transition-colors" style={{ color: 'var(--accent-text)' }}>{t('listings.clear_filters')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => <ListingCard key={listing.id} {...listing} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Link href={buildUrl({ page: String(currentPage - 1) })} className="p-2 rounded-lg border transition-colors" style={{ borderColor: 'var(--border)' }}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
          <span className="text-sm px-3 py-2" style={{ color: 'var(--text-tertiary)' }}>{currentPage} / {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={buildUrl({ page: String(currentPage + 1) })} className="p-2 rounded-lg border transition-colors" style={{ borderColor: 'var(--border)' }}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
