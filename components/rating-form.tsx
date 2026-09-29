'use client';

import { useState } from 'react';
import { RatingStars } from '@/components/rating-stars';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';

interface RatingFormProps {
  listingId: string;
  sellerId: string;
  buyerId?: string;
  onSuccess?: (rating: any) => void;
}

export function RatingForm({ listingId, sellerId, buyerId, onSuccess }: RatingFormProps) {
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score < 1 || score > 5) {
      setError('Lūdzu, izvēlieties vērtējumu no 1 līdz 5 zvaigznēm');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          score,
          comment: comment.trim() || undefined,
          buyerId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Neizdevās saglabāt vērtējumu');
      } else {
        setSuccess(true);
        if (onSuccess) {
          onSuccess(data);
        }
      }
    } catch (err) {
      setError('Tīkla kļūda. Lūdzu, mēģiniet vēlreiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Paldies par atsauksmi!</p>
          <p className="text-xs text-emerald-300/80">Jūsu vērtējums par pārdevēju ir saglabāts.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Novērtēt pārdevēju
        </h4>
        <RatingStars score={score} size="md" interactive onRate={(newScore) => setScore(newScore)} />
      </div>

      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Uzrakstiet komentāru par darījumu (pēc izvēles)..."
          rows={3}
          maxLength={1000}
          className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] p-3 text-sm text-white placeholder-white/40 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium text-sm transition-colors"
      >
        {submitting ? 'Saglabā...' : 'Iesniegt atsauksmi'}
      </Button>
    </form>
  );
}
