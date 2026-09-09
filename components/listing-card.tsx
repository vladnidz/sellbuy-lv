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
    <Link href={`/listings/${id}`} className="group block bg-[#12121a] border border-[#1e1e2a] rounded-lg overflow-hidden hover:border-[#2a2a3a] transition-colors">
      {/* Image */}
      <div className="aspect-[4/3] bg-[#15151f] overflow-hidden">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#2a2a3a]">
            <span className="text-4xl"> </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {categoryName && (
          <span className="text-xs text-[#6a6a7a]">{categoryName}</span>
        )}
        <h3 className="text-sm font-medium text-[#e8e8ed] mt-1 line-clamp-2 leading-snug">{title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#e8e8ed]">€{price.toFixed(2)}</span>
          {city && (
            <span className="flex items-center gap-1 text-xs text-[#4a4a5a]">
              <MapPin className="h-3 w-3" />
              {city}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
