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

export function ListingCard({
  id,
  title,
  price,
  images,
  city,
  categoryName,
}: ListingCardProps) {
  return (
    <Link href={`/listings/${id}`} className="group block">
      <article className="rounded-2xl border border-[#1f1f2e] bg-[#12121a] overflow-hidden transition-all duration-200 hover:border-[#2a2a3a] hover:bg-[#15151f]">
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-[#0a0a0f] relative">
          {images.length > 0 && images[0] ? (
            <img
              src={images[0]}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#12121a] to-[#0a0a0f]">
              <span className="text-[#55556a] text-sm font-medium">{title.charAt(0)}</span>
            </div>
          )}
          <span className="absolute top-3 right-3 bg-[#0a0a0f]/80 backdrop-blur-sm text-[#a78bfa] text-xs font-medium rounded-lg px-2.5 py-1">
            {categoryName}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-[#f0f0f5] truncate group-hover:text-[#a78bfa] transition-colors duration-150">
            {title}
          </h3>
          <p className="text-lg font-semibold text-[#f0f0f5] mt-2">
            €{price.toFixed(2)}
          </p>
          {city && (
            <p className="text-xs text-[#55556a] mt-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {city}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
