'use client';

import { ShieldCheck, CheckCircle2, Car, Calendar, Gauge, AlertCircle, FileText } from 'lucide-react';

export interface VehicleVerificationProps {
  vin?: string | null;
  vinVerified?: boolean;
  plateNumber?: string | null;
  plateVerified?: boolean;
  year?: number | null;
  mileage?: number | null;
  engineVolume?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  sellerVerified?: boolean;
  className?: string;
}

export function VehicleVerificationCard({
  vin,
  vinVerified = true,
  plateNumber,
  plateVerified = true,
  year,
  mileage,
  engineVolume,
  fuelType,
  transmission,
  bodyType,
  sellerVerified = true,
  className = '',
}: VehicleVerificationProps) {
  if (!vin && !plateNumber && !year) return null;

  // Masked VIN for privacy (e.g. WBADT41000G****12)
  const maskedVin = vin && vin.length === 17
    ? `${vin.slice(0, 11)}****${vin.slice(15)}`
    : vin;

  return (
    <div
      className={`rounded-xl border p-5 space-y-4 ${className}`}
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              Pārbaudīts transportlīdzeklis
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wide">
                SellBuy Trust Standard
              </span>
            </h4>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Tehniskie dati un nobraukums pārbaudīts pēc valsts reģistriem
            </p>
          </div>
        </div>

        {sellerVerified && (
          <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#7c3aed] bg-[#7c3aed]/10 px-2.5 py-1 rounded-full border border-[#7c3aed]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pārbaudīts pārdevējs</span>
          </div>
        )}
      </div>

      {/* Trust Grid: VIN & Plate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {vin && (
          <div className="p-3 rounded-lg border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                VIN Vēstures pārbaude
              </span>
              <span className="font-mono text-sm font-semibold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                {maskedVin}
              </span>
            </div>
            {vinVerified ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pārbaudīts
              </span>
            ) : (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Nav apstiprināts
              </span>
            )}
          </div>
        )}

        {plateNumber && (
          <div className="p-3 rounded-lg border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                Valsts reģistrācijas numurs
              </span>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-black font-mono font-bold text-xs border border-gray-300">
                <span className="text-blue-700 font-extrabold text-[10px]">LV</span>
                <span>{plateNumber.toUpperCase()}</span>
              </div>
            </div>
            {plateVerified && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> CSDD aktīvs
              </span>
            )}
          </div>
        )}
      </div>

      {/* Vehicle Specs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        {year && (
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Gads</span>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {year}
            </span>
          </div>
        )}

        {mileage !== undefined && mileage !== null && (
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Gauge className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Nobraukums</span>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {new Intl.NumberFormat('lv-LV').format(mileage)} km
            </span>
          </div>
        )}

        {fuelType && (
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Car className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Degviela</span>
            </div>
            <span className="font-semibold text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
              {fuelType}
            </span>
          </div>
        )}

        {transmission && (
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Ātrumkārba</span>
            </div>
            <span className="font-semibold text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
              {transmission}
            </span>
          </div>
        )}

        {engineVolume && (
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Car className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Dzinējs</span>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {engineVolume.toFixed(1)} L
            </span>
          </div>
        )}

        {bodyType && (
          <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Car className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Virsbūve</span>
            </div>
            <span className="font-semibold text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
              {bodyType}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
