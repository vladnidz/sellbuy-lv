'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  images: string[];
  city: string | null;
  categoryName: string;
}

export function ListingCard({ id, title, price, images, city, categoryName }: ListingCardProps) {
  return (
    <Link
      href={`/listings/${id}`}
      className="group block rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        boxShadow: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(124, 90, 237, 0.3)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(124, 90, 237, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="aspect-[4/3] overflow-hidden relative" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <span className="text-4xl opacity-30"> </span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 backdrop-blur-sm text-white font-bold text-sm rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(10, 10, 15, 0.8)' }}>
          €{price.toFixed(2)}
        </div>
      </div>
      <div className="p-4">
        {categoryName && (
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            {categoryName}
          </span>
        )}
        <h3 className="text-sm font-medium line-clamp-2 mt-1 leading-snug" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <div className="flex items-center justify-between mt-3">
          {city && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <MapPin className="h-3 w-3" />
              {city}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
