'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';

interface ListingItem {
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

interface ListingsPageClientProps {
  listings: ListingItem[];
  categories: Category[];
  cities: string[];
  total: number;
  page: number;
  pageSize: number;
  currentFilters: {
    q: string;
    category: string;
    minPrice?: string;
    maxPrice?: string;
    sort: string;
    city: string;
  };
}

export function ListingsPageClient({
  listings,
  categories,
  cities,
  total,
  page,
  pageSize,
  currentFilters,
}: ListingsPageClientProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(currentFilters.q);

  const totalPages = Math.ceil(total / pageSize);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    if (currentFilters.q) params.set('q', currentFilters.q);
    if (currentFilters.category) params.set('category', currentFilters.category);
    if (currentFilters.minPrice) params.set('minPrice', currentFilters.minPrice);
    if (currentFilters.maxPrice) params.set('maxPrice', currentFilters.maxPrice);
    if (currentFilters.sort) params.set('sort', currentFilters.sort);
    if (currentFilters.city) params.set('city', currentFilters.city);
    
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    
    router.push(`/listings?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilter('q', searchQuery);
  }

  function clearFilters() {
    router.push('/listings');
  }

  const hasActiveFilters = currentFilters.q || currentFilters.category || currentFilters.minPrice || currentFilters.maxPrice || currentFilters.city;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#f0f0f5] tracking-tight">
            Sludinājumi
          </h1>
          <p className="text-[#8888a0] mt-1">
            {total} {total === 1 ? 'sludinājums' : 'sludinājumi'}
          </p>
        </div>

        {/* Search + Filter toggle */}
        <div className="flex gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Meklēt sludinājumus..."
              className="w-full bg-[#12121a] border border-[#1f1f2e] rounded-xl pl-11 pr-4 py-3 text-[#f0f0f5] placeholder:text-[#55556a] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed/20] transition-all"
            />
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-[#7c3aed/10] border-[#7c3aed/20] text-[#a78bfa]'
                : 'bg-[#12121a] border-[#1f1f2e] text-[#8888a0] hover:text-[#f0f0f5] hover:border-[#2a2a3a]'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">Filtri</span>
          </button>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {currentFilters.q && (
              <span className="flex items-center gap-1.5 bg-[#7c3aed/10] text-[#a78bfa] text-xs font-medium rounded-lg px-2.5 py-1">
                Meklēšana: {currentFilters.q}
                <button onClick={() => updateFilter('q', '')} className="hover:text-white"><X className="h-3 w-3" /></button>
              </span>
            )}
            {currentFilters.category && (
              <span className="flex items-center gap-1.5 bg-[#7c3aed/10] text-[#a78bfa] text-xs font-medium rounded-lg px-2.5 py-1">
                Kategorija: {currentFilters.category}
                <button onClick={() => updateFilter('category', '')} className="hover:text-white"><X className="h-3 w-3" /></button>
              </span>
            )}
            {currentFilters.city && (
              <span className="flex items-center gap-1.5 bg-[#7c3aed/10] text-[#a78bfa] text-xs font-medium rounded-lg px-2.5 py-1">
                Pilsēta: {currentFilters.city}
                <button onClick={() => updateFilter('city', '')} className="hover:text-white"><X className="h-3 w-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-[#55556a] hover:text-[#8888a0] transition-colors">
              Notīrīt visus
            </button>
          </div>
        )}

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-[#12121a] border border-[#1f1f2e] rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-[#55556a] uppercase tracking-wider mb-2">Kategorija</label>
                <select
                  value={currentFilters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-[#1f1f2e] rounded-xl px-3 py-2.5 text-sm text-[#f0f0f5] focus:border-[#7c3aed] transition-colors"
                >
                  <option value="">Visas kategorijas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-medium text-[#55556a] uppercase tracking-wider mb-2">Pilsēta</label>
                <select
                  value={currentFilters.city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-[#1f1f2e] rounded-xl px-3 py-2.5 text-sm text-[#f0f0f5] focus:border-[#7c3aed] transition-colors"
                >
                  <option value="">Visas pilsētas</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-xs font-medium text-[#55556a] uppercase tracking-wider mb-2">Cena no</label>
                <input
                  type="number"
                  value={currentFilters.minPrice || ''}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  placeholder="€0"
                  className="w-full bg-[#0a0a0f] border border-[#1f1f2e] rounded-xl px-3 py-2.5 text-sm text-[#f0f0f5] placeholder:text-[#55556a] focus:border-[#7c3aed] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#55556a] uppercase tracking-wider mb-2">Cena līdz</label>
                <input
                  type="number"
                  value={currentFilters.maxPrice || ''}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  placeholder="€999999"
                  className="w-full bg-[#0a0a0f] border border-[#1f1f2e] rounded-xl px-3 py-2.5 text-sm text-[#f0f0f5] placeholder:text-[#55556a] focus:border-[#7c3aed] transition-colors"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mt-4 pt-4 border-t border-[#1f1f2e]">
              <label className="block text-xs font-medium text-[#55556a] uppercase tracking-wider mb-2">Kārtot pēc</label>
              <div className="flex gap-2">
                {[
                  { value: 'newest', label: 'Jaunākie' },
                  { value: 'price_asc', label: 'Cena ↑' },
                  { value: 'price_desc', label: 'Cena ↓' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('sort', opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentFilters.sort === opt.value
                        ? 'bg-[#7c3aed/10] text-[#a78bfa]'
                        : 'text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#1a1a25]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Listings grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl opacity-10 mb-4">��</div>
            <h2 className="text-xl font-semibold text-[#f0f0f5] mb-2">Nav atrasti sludinājumi</h2>
            <p className="text-[#8888a0] mb-6">Mēģiniet mainīt meklēšanas kritērijus</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-xl px-6 py-3 transition-colors"
              >
                Notīrīt filtrus
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Link
              href={`/listings?${new URLSearchParams({ ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v)), page: String(page - 1) }).toString()}`}
              className={`p-2 rounded-lg transition-colors ${page <= 1 ? 'text-[#55556a] pointer-events-none' : 'text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#12121a]'}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Link
                  key={pageNum}
                  href={`/listings?${new URLSearchParams({ ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v)), page: String(pageNum) }).toString()}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    pageNum === page
                      ? 'bg-[#7c3aed] text-white'
                      : 'text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#12121a]'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
            <Link
              href={`/listings?${new URLSearchParams({ ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v)), page: String(page + 1) }).toString()}`}
              className={`p-2 rounded-lg transition-colors ${page >= totalPages ? 'text-[#55556a] pointer-events-none' : 'text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#12121a]'}`}
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
