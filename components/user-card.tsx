'use client';

import Link from 'next/link';
import { RatingStars } from '@/components/rating-stars';
import { Badge } from '@/components/ui/badge';

interface UserCardProps {
  userId: string;
  name: string | null;
  averageRating: number;
  totalRatings: number;
  listingCount?: number;
}

export function UserCard({
  userId,
  name,
  averageRating,
  totalRatings,
  listingCount,
}: UserCardProps) {
  return (
    <Link href={`/profile/${userId}`}>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">
            {(name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {name || 'Lietotājs'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <RatingStars score={Math.round(averageRating)} size="sm" />
              <span className="text-xs text-white/50">
                {totalRatings > 0 ? `(${totalRatings})` : 'Nav vērtējumu'}
              </span>
            </div>
          </div>
          {listingCount !== undefined && (
            <Badge variant="secondary" className="bg-white/10 text-white/70">
              {listingCount} slud.
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
