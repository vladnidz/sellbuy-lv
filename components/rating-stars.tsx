'use client';

import { Star } from 'lucide-react';

interface RatingStarsProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (score: number) => void;
}

export function RatingStars({
  score,
  maxScore = 5,
  size = 'md',
  interactive = false,
  onRate,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxScore }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= score;
        const isHalf = !isFilled && starValue - 0.5 <= score;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isHalf
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'fill-transparent text-white/20'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
