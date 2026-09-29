'use client';

import { useState } from 'react';
import { RatingCard } from '@/components/rating-card';
import { RatingForm } from '@/components/rating-form';
import { Star } from 'lucide-react';

interface RatingItem {
  id?: string;
  score: number;
  comment: string | null;
  createdAt: Date | string;
  buyer: { name: string | null };
}

interface ListingRatingsSectionProps {
  listingId: string;
  sellerId: string;
  sellerName?: string | null;
  initialRatings?: RatingItem[];
}

export function ListingRatingsSection({
  listingId,
  sellerId,
  sellerName,
  initialRatings = [],
}: ListingRatingsSectionProps) {
  const [ratings, setRatings] = useState<RatingItem[]>(initialRatings);
  const [showForm, setShowForm] = useState(false);

  const avgScore =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
      : null;

  const handleRatingSuccess = (newRating: any) => {
    setRatings((prev) => [
      {
        id: newRating.id,
        score: newRating.score,
        comment: newRating.comment,
        createdAt: newRating.createdAt || new Date().toISOString(),
        buyer: { name: newRating.buyer?.name || 'Pircējs' },
      },
      ...prev,
    ]);
    setShowForm(false);
  };

  return (
    <div className="bg-[#12121a] border border-[#1f1f2e] rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Atsauksmes un vērtējumi
          </h2>
          {avgScore && (
            <p className="text-sm text-[#8888a0] mt-1">
              Vidējais vērtējums: <span className="text-white font-medium">{avgScore} / 5</span> ({ratings.length} {ratings.length === 1 ? 'atsauksme' : 'atsauksmes'})
            </p>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs bg-[#7c3aed]/10 text-[#a78bfa] hover:bg-[#7c3aed]/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            + Pievienot atsauksmi
          </button>
        )}
      </div>

      {showForm && (
        <RatingForm
          listingId={listingId}
          sellerId={sellerId}
          onSuccess={handleRatingSuccess}
        />
      )}

      <div className="space-y-3">
        {ratings.length === 0 ? (
          <p className="text-sm text-[#55556a] italic">Šim pārdevējam pagaidām nav atsauksmju.</p>
        ) : (
          ratings.map((rating, idx) => (
            <RatingCard
              key={rating.id || idx}
              score={rating.score}
              comment={rating.comment}
              reviewerName={rating.buyer?.name}
              date={typeof rating.createdAt === 'string' ? rating.createdAt : rating.createdAt.toISOString()}
            />
          ))
        )}
      </div>
    </div>
  );
}
