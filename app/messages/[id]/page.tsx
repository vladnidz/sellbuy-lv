'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageBubble } from '@/components/message-bubble';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string | null };
}

interface Chat {
  id: string;
  buyer: { id: string; name: string | null };
  seller: { id: string; name: string | null };
  listing: { id: string; title: string; price: number };
  messages: Message[];
}

export default function ConversationPage() {
  const params = useParams();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Demo user ID
  const userId = 'demo-user-id';

  useEffect(() => {
    async function fetchChat() {
      try {
        const res = await fetch(`/api/messages/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setChat(data);
        }
      } catch (error) {
        console.error('Failed to fetch chat:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchChat();
    }
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !chat || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chat.id,
          content: newMessage.trim(),
          senderId: userId,
        }),
      });

      if (res.ok) {
        const message = await res.json();
        setChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, message],
          };
        });
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Saruna nav atrasta</h1>
          <Link href="/messages">
            <Button variant="outline" className="border-white/20 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atpakaļ uz ziņām
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = chat.buyer.id === userId ? chat.seller : chat.buyer;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <Link href="/messages" className="text-sm text-white/50 hover:text-white mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Atpakaļ uz ziņām
        </Link>

        <Card className="glass-morphism border-white/10 bg-white/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white">
                {(otherUser.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-medium text-white">
                  {otherUser.name || 'Lietotājs'}
                </h2>
                <p className="text-xs text-white/50">
                  Par: {chat.listing.title} — €{Number(chat.listing.price).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-1">
        {chat.messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            isOwn={message.senderId === userId}
            senderName={message.sender.name || 'Lietotājs'}
            timestamp={message.createdAt}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Rakstiet ziņu..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
        <Button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
