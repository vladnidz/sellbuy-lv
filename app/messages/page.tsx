'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ArrowLeft } from 'lucide-react';

interface Chat {
  id: string;
  buyer: { id: string; name: string | null };
  seller: { id: string; name: string | null };
  listing: { id: string; title: string; price: number; images: string[] };
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  }>;
}

export default function MessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  // Demo user ID - in production this would come from auth
  const userId = 'demo-user-id';

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch(`/api/messages?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setChats(data);
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-white/50 hover:text-white mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Atpakaļ
        </Link>
        <h1 className="text-2xl font-bold text-white">Ziņas</h1>
      </div>

      {chats.length === 0 ? (
        <Card className="glass-morphism border-white/10 bg-white/5">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Nav ziņu</h2>
            <p className="text-white/50">
              Sāciet sarunu no kāda sludinājuma lapas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => {
            const otherUser = chat.buyer.id === userId ? chat.seller : chat.buyer;
            const lastMessage = chat.messages[0];

            return (
              <Link key={chat.id} href={`/messages/${chat.id}`}>
                <Card className="glass-morphism border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white">
                        {(otherUser.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-white truncate">
                            {otherUser.name || 'Lietotājs'}
                          </h3>
                          {lastMessage && (
                            <time className="text-xs text-white/30">
                              {new Date(lastMessage.createdAt).toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit' })}
                            </time>
                          )}
                        </div>
                        <p className="text-xs text-white/50 truncate mb-1">
                          {chat.listing.title}
                        </p>
                        {lastMessage && (
                          <p className="text-sm text-white/60 truncate">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
