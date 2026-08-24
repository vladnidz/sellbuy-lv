"use client";

import { useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterProps {
  categories: Array<{ id: string; name: string }>;
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

function buildUrl(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'newest') {
      searchParams.set(key, String(value));
    }
  });
  return `/listings?${searchParams.toString()}`;
}

export function Filters({ categories }: FilterProps) {
  const searchParams = useSearchParams();
  const currentParams: Record<string, string | undefined> = Object.fromEntries(searchParams.entries());

  const handleCategoryChange = (value: string) => {
    const newParams: Record<string, string | undefined> = { ...currentParams, category: value || undefined, page: undefined };
    window.location.href = buildUrl(newParams);
  };

  const handlePriceRangeChange = (range: string) => {
    const newParams: Record<string, string | undefined> = { ...currentParams, page: undefined };
    if (!range) {
      delete newParams.minPrice;
      delete newParams.maxPrice;
    } else {
      const [min, max] = range.split('-');
      if (min && min !== '0') newParams.minPrice = min;
      if (max && max !== '-') newParams.maxPrice = max;
      else if (max === '-') delete newParams.maxPrice;
    }
    window.location.href = buildUrl(newParams);
  };

  const handleSortChange = (value: string) => {
    const newParams: Record<string, string | undefined> = { ...currentParams, sort: value, page: undefined };
    window.location.href = buildUrl(newParams);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-slate-900/30 border border-slate-800 rounded-xl">
      <div className="flex-1">
        <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
          Kategorija
        </label>
        <Select
          value={currentParams.category || ''}
          onValueChange={handleCategoryChange}
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
          value={currentParams.priceRange || ''}
          onValueChange={handlePriceRangeChange}
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
          value={currentParams.sort || 'newest'}
          onValueChange={handleSortChange}
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
  );
}