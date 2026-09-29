'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, X, Send, Tag, User } from 'lucide-react';
import { useAuth } from '@/app/lib/auth';
import Image from 'next/image';

interface ChatInitiateButtonProps {
  listingId: string;
  sellerId: string;
  listingTitle?: string;
  listingPrice?: number;
  listingImage?: string;
  sellerName?: string;
  className?: string;
}

export function ChatInitiateButton({
  listingId,
  sellerId,
  listingTitle = '',
  listingPrice,
  listingImage,
  sellerName,
  className = '',
}: ChatInitiateButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(() => 
    listingTitle 
      ? `Labdien! Mani interesē jūsu sludinājums "${listingTitle}". Vai tas vēl ir pieejams?`
      : 'Labdien! Vēlos uzzināt vairāk par šo sludinājumu.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.id === sellerId;

  const handleOpenModal = () => {
    if (isOwner) {
      setError('Nevarat nosūtīt ziņu sev par savu sludinājumu.');
      return;
    }
    setError(null);
    setIsOpen(true);
  };

  const handleInitiateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Lūdzu, ievadiet ziņas tekstu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const buyerId = user?.id || 'demo-user-id';

      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          buyerId,
          initialMessage: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Neizdevās izveidot čatu');
      }

      const data = await res.json();
      const chatId = data.chat?.id || data.id;

      if (chatId) {
        setIsOpen(false);
        router.push(`/messages/${chatId}`);
      } else {
        throw new Error('Netika saņemts čata ID');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Kļūda sazinoties ar pārdevēju';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isOwner) {
    return (
      <div className="space-y-1">
        <Button
          disabled
          className={`w-full bg-[#2e2e42] text-[#8888a0] cursor-not-allowed ${className}`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Jūsu sludinājums
        </Button>
      </div>
    );
  }

  const priceFormatted = listingPrice !== undefined
    ? new Intl.NumberFormat('lv-LV', { style: 'currency', currency: 'EUR' }).format(listingPrice)
    : null;

  return (
    <>
      <div className="space-y-2">
        <Button
          onClick={handleOpenModal}
          className={`w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium ${className}`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Sazināties ar pārdevēju
        </Button>

        {error && !isOpen && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12121a] border border-[#1f1f2e] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1f1f2e]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#7c3aed]" />
                <h3 className="font-semibold text-lg text-white">Sazināties ar pārdevēju</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#8888a0] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#1f1f2e]"
                aria-label="Aizvērt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleInitiateChat} className="p-5 space-y-4">
              {/* Listing Context Preview */}
              <div className="flex items-center gap-3 bg-[#181824] p-3 rounded-xl border border-[#262638]">
                {listingImage ? (
                  <div className="w-14 h-14 rounded-lg overflow-hidden relative flex-shrink-0 bg-[#0a0a0f]">
                    <Image
                      src={listingImage}
                      alt={listingTitle || 'Sludinājums'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-[#262638] flex items-center justify-center text-[#8888a0] flex-shrink-0">
                    <Tag className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-white truncate">{listingTitle || 'Sludinājums'}</h4>
                  {priceFormatted && (
                    <div className="text-xs font-semibold text-[#a78bfa] mt-0.5">{priceFormatted}</div>
                  )}
                  {sellerName && (
                    <div className="text-xs text-[#8888a0] flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      <span>{sellerName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label htmlFor="initial-message-input" className="block text-xs font-medium text-[#8888a0] mb-2">
                  Jūsu ziņa pārdevējam
                </label>
                <textarea
                  id="initial-message-input"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Rakstiet ziņu..."
                  className="w-full bg-[#181824] border border-[#262638] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] text-white text-sm rounded-xl p-3.5 outline-none resize-none transition-all"
                  required
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="border-[#262638] bg-transparent text-[#8888a0] hover:bg-[#181824] hover:text-white"
                >
                  Atcelt
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Nosūta...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Nosūtīt ziņu
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
