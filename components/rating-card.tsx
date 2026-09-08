'use client';

import { RatingStars } from '@/components/rating-stars';

interface RatingCardProps {
  score: number;
  comment: string | null;
  reviewerName: string | null;
  date: string;
  listingTitle?: string;
}

export function RatingCard({
  score,
  comment,
  reviewerName,
  date,
  listingTitle,
}: RatingCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <RatingStars score={score} size="sm" />
            <span className="text-sm font-medium text-white">
              {reviewerName || 'Anonīms'}
            </span>
          </div>
          {listingTitle && (
            <p className="text-xs text-white/40 mt-1">
              Par: {listingTitle}
            </p>
          )}
        </div>
        <time className="text-xs text-white/30">
          {new Date(date).toLocaleDateString('lv-LV')}
        </time>
      </div>
      {comment && (
        <p className="text-sm text-white/70 mt-2">{comment}</p>
      )}
    </div>
  );
}
