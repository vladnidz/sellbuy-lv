'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <Link href={`/listings/${id}`}>
      <Card className="glass-morphism border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer group h-full">
        <CardContent className="p-0">
          {/* Image */}
          <div className="aspect-[4/3] rounded-t-xl overflow-hidden bg-gradient-to-br from-violet-500/20 to-indigo-600/20 relative">
            {images.length > 0 && images[0] ? (
              <img
                src={images[0]}
                alt={title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-4xl opacity-50">📷</span>
              </div>
            )}
            <Badge className="absolute top-2 right-2 bg-black/60 text-white/90 text-xs">
              {categoryName}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
              {title}
            </h3>
            <p className="text-xl font-bold text-violet-400 mt-2">
              €{price.toFixed(2)}
            </p>
            {city && (
              <p className="text-xs text-white/40 mt-2 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {city}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
