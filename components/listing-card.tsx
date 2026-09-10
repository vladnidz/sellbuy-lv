'use client';

import Link from 'next/link';
import { MapPin, Image as ImageIcon } from 'lucide-react';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  images: string[];
  city: string | null;
  categoryName: string;
  createdAt?: string;
}

export function ListingCard({ id, title, price, images, city, categoryName, createdAt }: ListingCardProps) {
  return (
    <Link 
      href={`/listings/${id}`} 
      className="group block bg-[#12121a] border border-[#1e1e2a] rounded-xl overflow-hidden hover:border-[#7c5aed]/30 hover:shadow-lg hover:shadow-[#7c5aed]/5 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a25] to-[#12121a] text-[#2a2a3a]">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
        
        {/* Gradient Overlay & Price Badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/60 to-transparent" />
        <div className="absolute bottom-2 left-2 bg-[#0a0a0f]/80 backdrop-blur-sm text-white font-bold text-sm rounded-full px-3 py-1">
          €{price.toFixed(2)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs text-[#7c5aed] font-medium uppercase tracking-wider">
          {categoryName}
        </span>
        <h3 className="text-sm font-medium text-[#e8e8ed] line-clamp-2 mt-1">
          {title}
        </h3>
        
        {/* Footer */}
        <div className="flex justify-between items-center mt-3">
          {city && (
            <span className="flex items-center gap-1 text-xs text-[#6a6a7a]">
              <MapPin className="h-3 w-3" />
              {city}
            </span>
          )}
          {createdAt && (
            <span className="text-xs text-[#4a4a5a]">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
