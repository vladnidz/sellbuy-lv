'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/lib/auth';
import { useLocale } from '@/app/lib/locale-context';
import { MessageSquare, Search, ChevronRight, Clock, ArrowLeft, Tag } from 'lucide-react';
import { ChatItem } from '@/app/lib/chat';

export default function MessagesInboxPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLocale();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUserId = user?.id || 'demo-user-id';

  useEffect(() => {
    let isMounted = true;

    async function loadChats() {
      try {
        setLoading(true);
        setError(null);
        // Try /api/chats first, fallback to /api/messages
        let res = await fetch(`/api/chats?userId=${encodeURIComponent(currentUserId)}`);
        if (!res.ok) {
          res = await fetch(`/api/messages?userId=${encodeURIComponent(currentUserId)}`);
        }
        if (!res.ok) {
          throw new Error('Neizdevās ielādēt sarakstes');
        }
        const data = await res.json();
        if (isMounted) {
          setChats(Array.isArray(data) ? data : []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Kļūda ielādējot sarakstes');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadChats();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase().trim();
    return chats.filter((c) => {
      const otherPartyName = (c.buyerId === currentUserId ? c.seller?.name : c.buyer?.name) || '';
      const listingTitle = c.listing?.title || '';
      const lastMessage = c.messages?.[0]?.content || '';
      return (
        otherPartyName.toLowerCase().includes(q) ||
        listingTitle.toLowerCase().includes(q) ||
        lastMessage.toLowerCase().includes(q)
      );
    });
  }, [chats, searchQuery, currentUserId]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Breadcrumb / Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <Link
              href="/listings"
              className="p-2 rounded-lg border hover:bg-[var(--surface-hover)] transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              title="Atpakaļ uz sludinājumiem"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <MessageSquare className="w-6 h-6 text-[#7c3aed]" />
                {t('chat.title') || 'Ziņojumi'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {chats.length > 0
                  ? `Kopā ${chats.length} aktīv${chats.length === 1 ? 'a' : 'as'} sarakst${chats.length === 1 ? 'e' : 'es'}`
                  : 'Pārvaldiet visas sarunas ar pircējiem un pārdevējiem vienuviet'}
              </p>
            </div>
          </div>

          {chats.length > 0 && (
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Meklēt sarunās..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#7c3aed] transition-colors"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}
        </div>

        {/* Content State */}
        {loading || authLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Ielādē sarakstes...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        ) : chats.length === 0 ? (
          <div
            className="py-16 px-6 text-center rounded-2xl border flex flex-col items-center justify-center space-y-4"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#7c3aed]/10 text-[#7c3aed]">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Nav aktīvu sarakstu
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Kad uzsāksiet sarunu ar pārdevēju vai saņemsiet ziņu par savu sludinājumu, tā parādīsies šeit.
              </p>
            </div>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white shadow-sm hover:opacity-90 transition-opacity bg-gradient-to-r from-[#7c3aed] to-[#6d28d9]"
            >
              Pārlūkot sludinājumus
            </Link>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            Nekas netika atrasts vaicājumam &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => {
              const isBuyer = chat.buyerId === currentUserId;
              const otherUser = isBuyer ? chat.seller : chat.buyer;
              const otherUserName = otherUser?.name || (isBuyer ? 'Pārdevējs' : 'Pircējs');
              const lastMsg = chat.messages?.[0];
              const listingImage = chat.listing?.images?.[0];
              const price = chat.listing?.price
                ? new Intl.NumberFormat('lv-LV', { style: 'currency', currency: 'EUR' }).format(Number(chat.listing.price))
                : null;

              return (
                <Link
                  key={chat.id}
                  href={`/messages/${chat.id}`}
                  className="group block p-4 rounded-xl border transition-all hover:shadow-md hover:border-[#7c3aed]/50"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* User Avatar */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5]">
                      {otherUserName.charAt(0).toUpperCase()}
                    </div>

                    {/* Chat details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                            {otherUserName}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full border shrink-0" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                            {isBuyer ? 'Pārdevējs' : 'Pircējs'}
                          </span>
                        </div>
                        {lastMsg?.createdAt && (
                          <span className="text-xs shrink-0 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                            <Clock className="w-3 h-3" />
                            {new Date(lastMsg.createdAt).toLocaleDateString('lv-LV', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      {/* Listing Context Pill */}
                      {chat.listing && (
                        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          <Tag className="w-3.5 h-3.5 text-[#7c3aed]" />
                          <span className="truncate max-w-[280px]">{chat.listing.title}</span>
                          {price && (
                            <span className="text-[#10b981] font-semibold">{price}</span>
                          )}
                        </div>
                      )}

                      {/* Last Message Snippet */}
                      <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                        {lastMsg ? (
                          <>
                            {lastMsg.senderId === currentUserId && <span className="font-medium text-xs text-[#7c3aed] mr-1">Jūs:</span>}
                            {lastMsg.content}
                          </>
                        ) : (
                          <span className="italic text-xs text-gray-400">Nav ziņu</span>
                        )}
                      </p>
                    </div>

                    {/* Listing Thumbnail Thumbnail (if exists) */}
                    {listingImage && (
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border shrink-0 hidden sm:block" style={{ borderColor: 'var(--border)' }}>
                        <Image
                          src={listingImage}
                          alt={chat.listing?.title || 'Preces attēls'}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                    )}

                    <ChevronRight className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-[#7c3aed] transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
