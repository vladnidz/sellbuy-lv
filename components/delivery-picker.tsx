'use client';

import { useState, useMemo } from 'react';
import { Search, Check, MapPin, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LATVIAN_LOCKERS, LockerOption, LockerProvider } from '@/components/locker-picker';

export type { LockerOption, LockerProvider };
export { LATVIAN_LOCKERS };

export interface DeliveryPickerProps {
  selectedLockerId?: string;
  onSelect?: (locker: LockerOption, estimatedFee?: number) => void;
  className?: string;
}

const PROVIDER_RATES: Record<LockerProvider, { fee: number; days: string }> = {
  omniva: { fee: 2.99, days: '1-2 dīenas' },
  dpd: { fee: 2.49, days: '1-2 dienas' },
  pasts: { fee: 1.99, days: '2-3 dienas' },
};

export function DeliveryPicker({ selectedLockerId, onSelect, className = '' }: DeliveryPickerProps) {
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
    const rateInfo = PROVIDER_RATES[locker.provider];
    if (onSelect) {
      onSelect(locker, rateInfo?.fee);
    }
  };

  const selectedLocker = useMemo(() => {
    return LATVIAN_LOCKERS.find((l) => l.id === selectedId);
  }, [selectedId]);

  return (
    <div className={`space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-[#7c3aed]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Omniva / DPD Pakomātu Piegāde</h3>
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
        <Button
          type="button"
          size="sm"
          variant={providerFilter === 'omniva' ? 'default' : 'outline'}
          onClick={() => setProviderFilter('omniva')}
          className="text-xs h-8"
        >
          Omniva (€2.99)
        </Button>
        <Button
          type="button"
          size="sm"
          variant={providerFilter === 'dpd' ? 'default' : 'outline'}
          onClick={() => setProviderFilter('dpd')}
          className="text-xs h-8"
        >
          DPD (€2.49)
        </Button>
        <Button
          type="button"
          size="sm"
          variant={providerFilter === 'pasts' ? 'default' : 'outline'}
          onClick={() => setProviderFilter('pasts')}
          className="text-xs h-8"
        >
          Latvijas Pasts (€1.99)
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Meklēt pēc pilsētas, nosaukuma vai adreses..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
        />
      </div>

      {/* Locker List */}
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
        {filteredLockers.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Netika atrasts neviens pakomāts.
          </div>
        ) : (
          filteredLockers.map((locker) => {
            const isSelected = locker.id === selectedId;
            const rate = PROVIDER_RATES[locker.provider];
            return (
              <button
                key={locker.id}
                type="button"
                onClick={() => handleSelect(locker)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[var(--text-primary)]'
                    : 'border-[var(--border)] hover:border-gray-400 bg-[var(--background)]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[var(--text-primary)]">{locker.name}</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0.5 uppercase tracking-wider"
                    >
                      {locker.provider}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>
                      {locker.city}, {locker.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      €{rate?.fee.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{rate?.days}</div>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selected Summary Footer */}
      {selectedLocker && (
        <div className="rounded-lg bg-[#7c3aed]/10 p-3 text-xs flex items-center justify-between border border-[#7c3aed]/20">
          <div>
            <span className="font-medium text-[var(--text-primary)]">Izvēlētais pakomāts: </span>
            <span className="text-[#7c3aed] font-semibold">{selectedLocker.name}</span>
          </div>
          <span className="font-bold text-[var(--text-primary)]">
            €{PROVIDER_RATES[selectedLocker.provider]?.fee.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
