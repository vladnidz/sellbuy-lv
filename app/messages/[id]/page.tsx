'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/app/lib/auth';
import { ArrowLeft, Send, ExternalLink, Sparkles, Loader2, Tag, ShieldCheck, DollarSign } from 'lucide-react';
import { ChatOfferCard, OfferData } from '@/components/chat-offer-card';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender?: { id: string; name: string | null };
}

interface Chat {
  id: string;
  buyerId: string;
  sellerId: string;
  buyer: { id: string; name: string | null };
  seller: { id: string; name: string | null };
  listing: {
    id: string;
    title: string;
    price: number | string;
    images?: string[];
    city?: string | null;
  };
  messages: Message[];
}

const QUICK_REPLIES = [
  'Labdien! Vai prece vēl ir pieejama?',
  'Kāda būtu pēdējā cena?',
  'Kur un cikos būtu ērtāk tikties?',
  'Vai iespējams nosūtīt ar Omniva / DPD pakomātu?',
  'Paldies! Labprāt iegādāšos.',
];

export default function ConversationPage() {
  const params = useParams();
  const chatId = params?.id as string;
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerSending, setOfferSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?.id || 'demo-user-id';

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Fetch chat details
  const fetchChat = useCallback(async (isInitial = false) => {
    if (!chatId) return;
    try {
      // Try /api/chats/[id] first, fallback to /api/messages/[id]
      let res = await fetch(`/api/chats/${chatId}?userId=${encodeURIComponent(currentUserId)}`);
      if (!res.ok) {
        res = await fetch(`/api/messages/${chatId}`);
      }
      if (res.ok) {
        const data = await res.json();
        setChat(data);
      } else {
        if (isInitial) setError('Saruna nav atrasta');
      }
    } catch (err) {
      console.error('Failed to fetch chat:', err);
      if (isInitial) setError('Kļūda ielādējot sarunu');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [chatId, currentUserId]);

  const fetchOffers = useCallback(async () => {
    if (!chatId) return;
    try {
      const res = await fetch(`/api/offers?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    }
  }, [chatId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    fetchChat(true);
    fetchOffers();
  }, [fetchChat, fetchOffers]);

  // Polling for new messages every 3 seconds
  useEffect(() => {
    if (!chatId) return;
    const interval = setInterval(() => {
      fetchChat(false);
      fetchOffers();
    }, 3000);

    return () => clearInterval(interval);
  }, [chatId, fetchChat, fetchOffers]);

  // Scroll to bottom on message list change
  useEffect(() => {
    if (chat?.messages?.length) {
      scrollToBottom('smooth');
    }
  }, [chat?.messages?.length, scrollToBottom]);

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(offerAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !chat) return;

    setOfferSending(true);
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chat.id,
          amount: parsedAmount,
          message: `Piedāvāju €${parsedAmount.toFixed(2)}`,
        }),
      });
      if (res.ok) {
        setOfferAmount('');
        setShowOfferInput(false);
        fetchOffers();
      }
    } catch (err) {
      console.error('Failed to send offer:', err);
    } finally {
      setOfferSending(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText ?? newMessage).trim();
    if (!textToSend || !chat || sending) return;

    setSending(true);
    setError(null);
    try {
      // Try /api/chats/[id]/messages first, fallback to /api/messages
      let res = await fetch(`/api/chats/${chat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textToSend,
          senderId: currentUserId,
        }),
      });

      if (!res.ok) {
        res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: chat.id,
            content: textToSend,
            senderId: currentUserId,
          }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        const created = data.message || data;
        setChat((prev) => {
          if (!prev) return prev;
          // Avoid duplicate messages if already present
          if (prev.messages.some((m) => m.id === created.id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, created],
          };
        });
        if (!messageText) {
          setNewMessage('');
        }
        setTimeout(() => scrollToBottom('smooth'), 50);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Neizdevās nosūtīt ziņu');
      }
    } catch (err: unknown) {
      console.error('Failed to send message:', err);
      setError('Kļūda nosūtot ziņu');
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setNewMessage(text);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-3 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Ielādē sarunu...
        </p>
      </div>
    );
  }

  if (!chat || error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {error || 'Saruna nav atrasta'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Iespējams, saruna ir dzēsta vai jums nav piekļuves tiesību.
          </p>
          <Link href="/messages">
            <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atpakaļ uz ziņām
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isBuyer = chat.buyerId === currentUserId;
  const otherUser = isBuyer ? chat.seller : chat.buyer;
  const otherUserName = otherUser?.name || (isBuyer ? 'Pārdevējs' : 'Pircējs');
  const price = chat.listing?.price
    ? new Intl.NumberFormat('lv-LV', { style: 'currency', currency: 'EUR' }).format(Number(chat.listing.price))
    : null;
  const listingImage = chat.listing?.images?.[0];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Bar with Navigation and Context */}
      <div className="sticky top-14 z-20 border-b backdrop-blur-md" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/messages"
              className="p-2 rounded-lg border hover:bg-[var(--surface-hover)] transition-colors shrink-0"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Avatar & Partner Name */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5]">
              {otherUserName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base truncate" style={{ color: 'var(--text-primary)' }}>
                  {otherUserName}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full border shrink-0" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                  {isBuyer ? 'Pārdevējs' : 'Pircējs'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Tiešsaistē (reāllaika sinhronizācija)
              </div>
            </div>
          </div>

          {/* Listing Mini Card Banner */}
          {chat.listing && (
            <Link
              href={`/listings/${chat.listing.id}`}
              className="group flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border hover:border-[#7c3aed]/50 transition-all shrink-0 max-w-[260px]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            >
              {listingImage ? (
                <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: 'var(--border)' }}>
                  <Image
                    src={listingImage}
                    alt={chat.listing.title}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#7c3aed]/10 text-[#7c3aed]">
                  <Tag className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0 text-left hidden sm:block">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {chat.listing.title}
                </p>
                {price && (
                  <p className="text-xs font-bold text-[#10b981]">{price}</p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#7c3aed] shrink-0" />
            </Link>
          )}

          {/* Structured Offer Launcher */}
          {isBuyer && (
            <button
              type="button"
              onClick={() => setShowOfferInput(!showOfferInput)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm shrink-0"
            >
              <DollarSign className="w-3.5 h-3.5" /> Piedāvāt cenu
            </button>
          )}
        </div>
      </div>

      {/* Offer Input Bar */}
      {showOfferInput && isBuyer && (
        <div className="border-b p-3 bg-purple-950/20 border-purple-500/30">
          <form onSubmit={handleSendOffer} className="max-w-4xl mx-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-300 whitespace-nowrap">
              Jūsu piedāvājums (€):
            </span>
            <input
              type="number"
              step="0.01"
              min="1"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder="Piem., 120.00"
              className="px-3 py-1.5 rounded-xl text-xs border bg-[var(--bg-surface)] focus:outline-none focus:ring-1 focus:ring-purple-500 w-32"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              required
            />
            <button
              type="submit"
              disabled={offerSending}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1"
            >
              {offerSending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Nosūtīt piedāvājumu
            </button>
            <button
              type="button"
              onClick={() => setShowOfferInput(false)}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white"
            >
              Atcelt
            </button>
          </form>
        </div>
      )}

      {/* Active Offers Banner / List */}
      {offers.length > 0 && (
        <div className="max-w-4xl w-full mx-auto px-4 pt-3 space-y-2">
          {offers.map((off) => (
            <ChatOfferCard
              key={off.id}
              offer={off}
              currentUserId={currentUserId}
              onStatusChange={() => fetchOffers()}
            />
          ))}
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto space-y-4">
        {/* Buyer/Seller Safety & Escrow Banner */}
        <div
          className="p-3 rounded-xl border flex items-center gap-2.5 text-xs"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <ShieldCheck className="w-4 h-4 text-[#7c3aed] shrink-0" />
          <span>
            Drošības ieteikums: Neveiciet maksājumus ārpus platformas un nepakļaujiet savus bankas datus. SellBuy garantē pirkuma drošību.
          </span>
        </div>

        {chat.messages.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Saruna ir uzsākta. Ierakstiet pirmo ziņu zemāk!
            </p>
          </div>
        ) : (
          chat.messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            const senderName = msg.sender?.name || (isOwn ? 'Jūs' : otherUserName);
            const timeFormatted = new Date(msg.createdAt).toLocaleTimeString('lv-LV', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] space-y-1`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white rounded-br-sm shadow-sm'
                        : 'border rounded-bl-sm shadow-sm'
                    }`}
                    style={
                      !isOwn
                        ? {
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }
                        : {}
                    }
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-1 text-[11px] ${isOwn ? 'justify-end' : 'justify-start'}`} style={{ color: 'var(--text-tertiary)' }}>
                    <span>{senderName}</span>
                    <span>•</span>
                    <span>{timeFormatted}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick-Reply Suggestions & Input Bar */}
      <div className="sticky bottom-0 border-t backdrop-blur-md" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-3">
          {/* Quick-Reply Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="flex items-center gap-1 text-[11px] font-medium shrink-0" style={{ color: 'var(--text-tertiary)' }}>
              <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
              Ātrās atbildes:
            </span>
            {QUICK_REPLIES.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-1 rounded-full border shrink-0 hover:border-[#7c3aed] hover:bg-[#7c3aed]/10 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Error notice if send fails */}
          {error && (
            <div className="text-xs text-red-400 px-1">{error}</div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ierakstiet ziņu... (Enter lai nosūtītu)"
              disabled={sending}
              className="flex-1 text-sm border focus:ring-2 focus:ring-[#7c3aed] transition-colors"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 shrink-0"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Nosūtīt</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
