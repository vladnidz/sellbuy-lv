'use client';

import { useState, useMemo } from 'react';
import { Package, Search, Check, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type LockerProvider = 'omniva' | 'dpd' | 'pasts';

export interface LockerOption {
  id: string;
  provider: LockerProvider;
  name: string;
  city: string;
  address: string;
}

export const LATVIAN_LOCKERS: LockerOption[] = [
  // Omniva
  { id: 'omniva-1', provider: 'omniva', name: 'Rīgas Akropole Alfa pakomāts', city: 'Rīga', address: 'Brīvības gatve 372' },
  { id: 'omniva-2', provider: 'omniva', name: 'Rīgas t/c Origo pakomāts', city: 'Rīga', address: 'Stacijas laukums 4' },
  { id: 'omniva-3', provider: 'omniva', name: 'Liepājas t/c Rietumu Centrs pakomāts', city: 'Liepāja', address: 'Jaunā ostmala 3/5' },
  { id: 'omniva-4', provider: 'omniva', name: 'Daugavpils t/c Ditton Nams pakomāts', city: 'Daugavpils', address: 'Cietokšņa iela 60' },
  { id: 'omniva-5', provider: 'omniva', name: 'Jelgavas t/c Pilsētas Pasāža pakomāts', city: 'Jelgava', address: 'Driksas iela 4' },
  { id: 'omniva-6', provider: 'omniva', name: 'Valmieras t/c Valleta pakomāts', city: 'Valmiera', address: 'Rīgas iela 4' },

  // DPD Pickup Network
  { id: 'dpd-1', provider: 'dpd', name: 'DPD Pickup Paku Skapis Rīga Spice', city: 'Rīga', address: 'Lielirbes iela 29' },
  { id: 'dpd-2', provider: 'dpd', name: 'DPD Pickup Paku Skapis Rīga Domina', city: 'Rīga', address: 'Ieriķu iela 3' },
  { id: 'dpd-3', provider: 'dpd', name: 'DPD Pickup Paku Skapis Ventspils', city: 'Ventspils', address: 'Lielais prospekts 3/5' },
  { id: 'dpd-4', provider: 'dpd', name: 'DPD Pickup Paku Skapis Rēzekne', city: 'Rēzekne', address: 'Atbrīvošanas aleja 141' },

  // Latvijas Pasts
  { id: 'pasts-1', provider: 'pasts', name: 'Latvijas Pasts Pakomāts Rīga Mols', city: 'Rīga', address: 'Krasta iela 46' },
  { id: 'pasts-2', provider: 'pasts', name: 'Latvijas Pasts Pakomāts Jūrmala Kauguri', city: 'Jūrmala', address: 'Talsu šoseja 31' },
];

export interface LockerPickerProps {
  selectedLockerId?: string;
  onSelect?: (locker: LockerOption) => void;
  className?: string;
}

const PROVIDER_CONFIG: Record<LockerProvider, { label: string; color: string }> = {
  omniva: { label: 'Omniva', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  dpd: { label: 'DPD', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  pasts: { label: 'Latvijas Pasts', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
};

export function LockerPicker({ selectedLockerId, onSelect, className = '' }: LockerPickerProps) {
  const [providerFilter, setProviderFilter] = useState<LockerProvider | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedLockerId);

  const filteredLockers = useMemo(() => {
    return LATVIAN_LOCKERS.filter((locker) => {
      const matchesProvider = providerFilter === 'all' || locker.provider === providerFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        locker.name.toLowerCase().includes(q) ||
        locker.city.toLowerCase().includes(q) ||
        locker.address.toLowerCase().includes(q);
      return matchesProvider && matchesSearch;
    });
  }, [providerFilter, searchQuery]);

  const handleSelect = (locker: LockerOption) => {
    setSelectedId(locker.id);
    if (onSelect) {
      onSelect(locker);
    }
  };

  return (
    <div className={`space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-[#7c3aed]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Piegāde uz pakomātu</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Latvija
        </Badge>
      </div>

      {/* Provider Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={providerFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setProviderFilter('all')}
          className="text-xs h-8"
        >
          Visi pakomāti
        </Button>
        {(['omniva', 'dpd', 'pasts'] as LockerProvider[]).map((prov) => (
          <Button
            key={prov}
            type="button"
            size="sm"
            variant={providerFilter === prov ? 'default' : 'outline'}
            onClick={() => setProviderFilter(prov)}
            className="text-xs h-8"
          >
            {PROVIDER_CONFIG[prov].label}
          </Button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Meklēt pēc pilsētas vai nosaukuma (piem. Rīga, Alfa)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#7c3aed] focus:outline-none"
        />
      </div>

      {/* Locker Options List */}
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
        {filteredLockers.length === 0 ? (
          <p className="text-center py-4 text-sm text-[var(--text-muted)] italic">
            Neviens pakomāts netika atrasts.
          </p>
        ) : (
          filteredLockers.map((locker) => {
            const isSelected = selectedId === locker.id;
            const provConfig = PROVIDER_CONFIG[locker.provider];

            return (
              <button
                key={locker.id}
                type="button"
                onClick={() => handleSelect(locker)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-[#7c3aed] bg-[#7c3aed]/10'
                    : 'border-[var(--border)] bg-[var(--background)] hover:border-[#7c3aed]/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${provConfig.color}`}>
                      {provConfig.label}
                    </Badge>
                    <span className="font-medium text-sm text-[var(--text-primary)]">{locker.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {locker.city}, {locker.address}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="h-5 w-5 text-[#7c3aed] shrink-0 mt-0.5" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
