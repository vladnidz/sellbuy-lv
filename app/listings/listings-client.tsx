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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#e8e8ed] tracking-tight">Sludinājumi</h1>
          <p className="text-sm text-[#6a6a7a] mt-1">{total} {total === 1 ? 'rezultāts' : 'rezultāti'}</p>
        </div>

        {/* Search + filter toggle */}
        <div className="flex gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-[#12121a] border border-[#1e1e2a] rounded-lg overflow-hidden">
            <Search className="ml-4 h-4 w-4 text-[#4a4a5a] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Meklēt..."
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[#e8e8ed] placeholder:text-[#4a4a5a] outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); updateFilter('q', ''); }} className="px-2 text-[#4a4a5a] hover:text-[#8a8a9a]">
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-[#7c5aed]/10 border-[#7c5aed]/20 text-[#a78bfa]'
                : 'bg-[#12121a] border-[#1e1e2a] text-[#8a8a9a] hover:text-[#e8e8ed] hover:border-[#2a2a3a]'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtri</span>
          </button>
        </div>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {currentFilters.q && (
              <span className="flex items-center gap-1.5 bg-[#7c5aed]/10 text-[#a78bfa] text-xs font-medium rounded-md px-2 py-1">
                {currentFilters.q}
                <button onClick={() => updateFilter('q', '')}><X className="h-3 w-3" /></button>
              </span>
            )}
            {currentFilters.category && (
              <span className="flex items-center gap-1.5 bg-[#7c5aed]/10 text-[#a78bfa] text-xs font-medium rounded-md px-2 py-1">
                {currentFilters.category}
                <button onClick={() => updateFilter('category', '')}><X className="h-3 w-3" /></button>
              </span>
            )}
            {currentFilters.city && (
              <span className="flex items-center gap-1.5 bg-[#7c5aed]/10 text-[#a78bfa] text-xs font-medium rounded-md px-2 py-1">
                {currentFilters.city}
                <button onClick={() => updateFilter('city', '')}><X className="h-3 w-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-[#4a4a5a] hover:text-[#8a8a9a]">Notīrīt</button>
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-[#12121a] border border-[#1e1e2a] rounded-lg p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-[#6a6a7a] mb-1.5">Kategorija</label>
                <select value={currentFilters.category} onChange={(e) => updateFilter('category', e.target.value)} className="w-full bg-[#0a0a0f] border border-[#1e1e2a] rounded-lg px-3 py-2 text-sm text-[#e8e8ed] outline-none">
                  <option value="">Visas</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6a6a7a] mb-1.5">Pilsēta</label>
                <select value={currentFilters.city} onChange={(e) => updateFilter('city', e.target.value)} className="w-full bg-[#0a0a0f] border border-[#1e1e2a] rounded-lg px-3 py-2 text-sm text-[#e8e8ed] outline-none">
                  <option value="">Visas</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6a6a7a] mb-1.5">Cena no</label>
                <input type="number" value={currentFilters.minPrice || ''} onChange={(e) => updateFilter('minPrice', e.target.value)} placeholder="€0" className="w-full bg-[#0a0a0f] border border-[#1e1e2a] rounded-lg px-3 py-2 text-sm text-[#e8e8ed] placeholder:text-[#4a4a5a] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#6a6a7a] mb-1.5">Cena līdz</label>
                <input type="number" value={currentFilters.maxPrice || ''} onChange={(e) => updateFilter('maxPrice', e.target.value)} placeholder="€999999" className="w-full bg-[#0a0a0f] border border-[#1e1e2a] rounded-lg px-3 py-2 text-sm text-[#e8e8ed] placeholder:text-[#4a4a5a] outline-none" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1e1e2a] flex flex-wrap gap-2">
              {['newest', 'price_asc', 'price_desc'].map((s) => (
                <button key={s} onClick={() => updateFilter('sort', s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${currentFilters.sort === s ? 'bg-[#7c5aed]/10 text-[#a78bfa]' : 'text-[#8a8a9a] hover:text-[#e8e8ed]'}`}>
                  {s === 'newest' ? 'Jaunākie' : s === 'price_asc' ? 'Cena ↑' : 'Cena ↓'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Listings grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((listing) => <ListingCard key={listing.id} {...listing} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#6a6a7a] mb-2">Nav atrasti sludinājumi</p>
            <p className="text-sm text-[#4a4a5a] mb-6">Mēģiniet mainīt meklēšanas kritērijus</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm bg-[#7c5aed] hover:bg-[#6a4bd4] text-white px-4 py-2 rounded-lg transition-colors">
                Notīrīt filtrus
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-10">
            <Link href={`/listings?${new URLSearchParams({ ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v)), page: String(page - 1) }).toString()}`} className={`p-2 rounded-md transition-colors ${page <= 1 ? 'text-[#2a2a3a] pointer-events-none' : 'text-[#8a8a9a] hover:text-[#e8e8ed]'}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Link key={pageNum} href={`/listings?${new URLSearchParams({ ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v)), page: String(pageNum) }).toString()}`} className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${pageNum === page ? 'bg-[#7c5aed] text-white' : 'text-[#8a8a9a] hover:text-[#e8e8ed]'}`}>
                  {pageNum}
                </Link>
              );
            })}
            <Link href={`/listings?${new URLSearchParams({ ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v)), page: String(page + 1) }).toString()}`} className={`p-2 rounded-md transition-colors ${page >= totalPages ? 'text-[#2a2a3a] pointer-events-none' : 'text-[#8a8a9a] hover:text-[#e8e8ed]'}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
