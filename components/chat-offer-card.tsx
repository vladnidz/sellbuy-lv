'use client';

import { useState } from 'react';
import { Tag, Check, X, Clock, Loader2 } from 'lucide-react';

export interface OfferData {
  id: string;
  chatId: string;
  buyerId: string;
  amount: number;
  currency: string;
  status: string; // open | accepted | declined | countered | expired
  message?: string | null;
  expiresAt: string;
  buyer?: { id: string; name: string | null };
}

interface ChatOfferCardProps {
  offer: OfferData;
  currentUserId: string;
  onStatusChange?: (updatedOffer: OfferData) => void;
}

export function ChatOfferCard({ offer, currentUserId, onStatusChange }: ChatOfferCardProps) {
  const [loadingAction, setLoadingAction] = useState<'accept' | 'decline' | null>(null);
  const [currentOffer, setCurrentOffer] = useState<OfferData>(offer);

  const isCreator = currentOffer.buyerId === currentUserId;
  const isOpen = currentOffer.status === 'open';

  const handleAction = async (action: 'accept' | 'decline') => {
    setLoadingAction(action);
    try {
      const res = await fetch('/api/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentOffer.id, action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentOffer(updated);
        if (onStatusChange) onStatusChange(updated);
      }
    } catch (err) {
      console.error('Failed to update offer', err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      className="my-3 p-4 rounded-2xl border transition-all max-w-md w-full shadow-sm"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor:
          currentOffer.status === 'accepted'
            ? 'rgba(16, 185, 129, 0.4)'
            : currentOffer.status === 'declined'
            ? 'rgba(239, 68, 68, 0.3)'
            : 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Tag className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            Cenas Piedāvājums
          </span>
        </div>

        {/* Status Badge */}
        {currentOffer.status === 'open' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Clock className="w-3 h-3" /> Gaida atbildi
          </span>
        )}
        {currentOffer.status === 'accepted' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Check className="w-3 h-3" /> Pieņemts!
          </span>
        )}
        {currentOffer.status === 'declined' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <X className="w-3 h-3" /> Noraidīts
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-black text-purple-400">
          €{Number(currentOffer.amount).toFixed(2)}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {isCreator ? 'Jūsu piedāvātā cena' : 'Pircēja piedāvātā cena'}
        </span>
      </div>

      {currentOffer.message && (
        <p className="text-xs italic mb-3" style={{ color: 'var(--text-secondary)' }}>
          &ldquo;{currentOffer.message}&rdquo;
        </p>
      )}

      {/* Recipient Action Controls */}
      {!isCreator && isOpen && (
        <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => handleAction('accept')}
            disabled={loadingAction !== null}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loadingAction === 'accept' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Pieņemt piedāvājumu
          </button>
          <button
            type="button"
            onClick={() => handleAction('decline')}
            disabled={loadingAction !== null}
            className="py-2 px-3 rounded-xl text-xs font-semibold border hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {loadingAction === 'decline' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
            ) : (
              'Noraidīt'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
