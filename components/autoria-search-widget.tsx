'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Car, ChevronRight, ShieldCheck } from 'lucide-react';

const POPULAR_BRANDS = [
  'BMW', 'Audi', 'Volkswagen', 'Mercedes-Benz', 'Toyota', 'Volvo', 'Skoda', 'Ford'
];

export function AutoRiaSearchWidget() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [vinVerifiedOnly, setVinVerifiedOnly] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('category', 'transports.vieglie_auto');
    if (selectedBrand) params.set('q', selectedBrand);
    if (priceFrom) params.set('minPrice', priceFrom);
    if (priceTo) params.set('maxPrice', priceTo);
    if (vinVerifiedOnly) params.set('vinVerified', 'true');
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto rounded-2xl border p-5 sm:p-6 shadow-xl relative backdrop-blur-md"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Tab Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-400">
          <Car className="w-5 h-5 text-purple-400" />
          <span>AutoRia / CSDD Pārbaudīti Auto</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">100% Pārbaudīti pēc VIN</span>
          <span className="sm:hidden">VIN pārbaude</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Brand Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-medium shrink-0" style={{ color: 'var(--text-tertiary)' }}>
            Marka:
          </span>
          <button
            type="button"
            onClick={() => setSelectedBrand('')}
            className={`px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-all ${
              !selectedBrand
                ? 'bg-purple-600 text-white border-purple-500'
                : 'hover:border-purple-500/40 text-[var(--text-secondary)]'
            }`}
            style={{ backgroundColor: !selectedBrand ? undefined : 'var(--bg-elevated)', borderColor: !selectedBrand ? undefined : 'var(--border)' }}
          >
            Visas markas
          </button>
          {POPULAR_BRANDS.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
              className={`px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-all ${
                selectedBrand === brand
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'hover:border-purple-500/40 text-[var(--text-secondary)]'
              }`}
              style={{ backgroundColor: selectedBrand === brand ? undefined : 'var(--bg-elevated)', borderColor: selectedBrand === brand ? undefined : 'var(--border)' }}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block mb-1 font-medium" style={{ color: 'var(--text-tertiary)' }}>Cena no (€)</label>
            <input
              type="number"
              placeholder="no 500"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" style={{ color: 'var(--text-tertiary)' }}>Cena līdz (€)</label>
            <input
              type="number"
              placeholder="līdz 25 000"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" style={{ color: 'var(--text-tertiary)' }}>Gads no</label>
            <input
              type="number"
              placeholder="no 2010"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" style={{ color: 'var(--text-tertiary)' }}>Gads līdz</label>
            <input
              type="number"
              placeholder="līdz 2026"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Footer Filter & Submit Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={vinVerifiedOnly}
              onChange={(e) => setVinVerifiedOnly(e.target.checked)}
              className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 w-4 h-4"
            />
            <span>Tikai ar pārbaudītu VIN un CSDD nobraukumu</span>
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md hover:shadow-lg transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Meklēt {selectedBrand || 'Auto'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
