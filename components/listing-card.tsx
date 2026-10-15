'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck, Car } from 'lucide-react';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  images: string[];
  city: string | null;
  categoryName: string;
}

export function ListingCard({ id, title, price, images, city, categoryName }: ListingCardProps) {
  const isAuto = categoryName.toLowerCase().includes('auto') || categoryName.toLowerCase().includes('transport');

  return (
    <Link
      href={`/listings/${id}`}
      className="group block rounded-xl overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-purple-500/40"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="aspect-[4/3] overflow-hidden relative" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        {images && images.length > 0 ? (
          <Image
            src={images[0]}
            alt={title}
            fill
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <span className="text-4xl opacity-30"> </span>
          </div>
        )}

        {/* Price Tag Pill */}
        <div className="absolute bottom-2 left-2 backdrop-blur-md text-white font-bold text-sm rounded-lg px-2.5 py-1" style={{ backgroundColor: 'rgba(10, 10, 15, 0.85)' }}>
          €{price.toFixed(2)}
        </div>

        {/* Verification badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isAuto && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-600/90 text-white px-2 py-0.5 rounded shadow backdrop-blur-sm">
              <Car className="w-3 h-3" /> VIN OK
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 text-white px-2 py-0.5 rounded shadow backdrop-blur-sm">
            <ShieldCheck className="w-3 h-3" /> Verificēts
          </span>
        </div>
      </div>

      <div className="p-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium truncate max-w-[150px] uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            {categoryName}
          </span>
          {city && (
            <span className="flex items-center gap-1 truncate max-w-[120px]" style={{ color: 'var(--text-tertiary)' }}>
              <MapPin className="w-3 h-3 shrink-0" />
              {city}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-sm line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
      </div>
    </Link>
  );
}
