'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterProps {
  categories: { id: string; name: string }[];
  currentParams: Record<string, string | undefined>;
}

export function ListingsFilters({ categories, currentParams }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset page on filter change
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-slate-900/30 border border-slate-800 rounded-xl">
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Kategorija
        </label>
        <Select
          value={currentParams.category || ''}
          onValueChange={(value) => updateFilters({ category: value })}
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
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Cenas diapazons
        </label>
        <Select
          value={currentParams.priceRange || ''}
          onValueChange={(value) => {
             const [min, max] = value.split('-');
             updateFilters({ minPrice: min, maxPrice: max, priceRange: value });
          }}
        >
          <SelectTrigger className="bg-slate-900 border-slate-700">
            <SelectValue placeholder="Jebkura cena" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            <SelectItem value="">Jebkura cena</SelectItem>
            <SelectItem value="0-50">0 - 50 EUR</SelectItem>
            <SelectItem value="50-100">50 - 100 EUR</SelectItem>
            <SelectItem value="100-500">100 - 500 EUR</SelectItem>
            <SelectItem value="500-1000">500 - 1000 EUR</SelectItem>
            <SelectItem value="1000-">1000+ EUR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Kārtot
        </label>
        <Select
          value={currentParams.sort || 'newest'}
          onValueChange={(value) => updateFilters({ sort: value })}
        >
          <SelectTrigger className="bg-slate-900 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            <SelectItem value="newest">Jaunākie</SelectItem>
            <SelectItem value="oldest">Vecākie</SelectItem>
            <SelectItem value="price_asc">Cena: no zēmākās</SelectItem>
            <SelectItem value="price_desc">Cena: no augstākās</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
