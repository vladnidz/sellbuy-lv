/**
 * Unit tests for GET/DELETE /api/chats/[id] and GET/POST /api/chats/[id]/messages
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { GET as getChat, DELETE as deleteChat } from '@/app/api/chats/[id]/route';
import { GET as getMessages, POST as postMessage } from '@/app/api/chats/[id]/messages/route';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/chats/[id]', () => {
  it('returns 404 when chat is not found', async () => {
    (prisma.chat.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/chats/chat-123');
    const res = await getChat(req, { params: Promise.resolve({ id: 'chat-123' }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Chat not found');
  });

  it('returns chat when found', async () => {
    const mockChat = {
      id: 'chat-123',
      listingId: 'listing-1',
      buyerId: 'user-1',
      sellerId: 'user-2',
      buyer: { id: 'user-1', name: 'Buyer', email: 'b@test.lv' },
      seller: { id: 'user-2', name: 'Seller', email: 's@test.lv' },
      listing: { id: 'listing-1', title: 'Car', price: 5000, images: [] },
      messages: [
        { id: 'msg-1', content: 'Hello', createdAt: new Date(), sender: { id: 'user-1', name: 'Buyer' } },
      ],
    };
    (prisma.chat.findUnique as jest.Mock).mockResolvedValue(mockChat);

    const req = new NextRequest('http://localhost/api/chats/chat-123?userId=user-1');
    const res = await getChat(req, { params: Promise.resolve({ id: 'chat-123' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe('chat-123');
    expect(body.messages).toHaveLength(1);
  });

  it('returns 403 when requesting user is not a participant', async () => {
    const mockChat = {
      id: 'chat-123',
      buyerId: 'user-1',
      sellerId: 'user-2',
    };
    (prisma.chat.findUnique as jest.Mock).mockResolvedValue(mockChat);

    const req = new NextRequest('http://localhost/api/chats/chat-123?userId=user-3');
    const res = await getChat(req, { params: Promise.resolve({ id: 'chat-123' }) });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toContain('Forbidden');
  });

  it('deletes chat when valid', async () => {
    (prisma.chat.findUnique as jest.Mock).mockResolvedValue({
      id: 'chat-123',
      buyerId: 'user-1',
      sellerId: 'user-2',
    });
    (prisma.message.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
    (prisma.chat.delete as jest.Mock).mockResolvedValue({ id: 'chat-123' });

    const req = new NextRequest('http://localhost/api/chats/chat-123?userId=user-1', { method: 'DELETE' });
    const res = await deleteChat(req, { params: Promise.resolve({ id: 'chat-123' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(prisma.chat.delete).toHaveBeenCalledWith({ where: { id: 'chat-123' } });
  });
});

describe('POST /api/chats/[id]/messages', () => {
  it('returns 401 when senderId is missing', async () => {
    const req = new NextRequest('http://localhost/api/chats/chat-123/messages', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello' }),
    });
    const res = await postMessage(req, { params: Promise.resolve({ id: 'chat-123' }) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain('senderId is required');
  });

  it('returns 400 when content is empty', async () => {
    const req = new NextRequest('http://localhost/api/chats/chat-123/messages', {
      method: 'POST',
      body: JSON.stringify({ content: '   ', senderId: 'user-1' }),
    });
    const res = await postMessage(req, { params: Promise.resolve({ id: 'chat-123' }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Content is required');
  });

  it('returns 404 when chat is not found', async () => {
    (prisma.chat.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/chats/chat-123/messages', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello', senderId: 'user-1' }),
    });
    const res = await postMessage(req, { params: Promise.resolve({ id: 'chat-123' }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Chat not found');
  });

  it('returns 403 when sender is not a participant', async () => {
    (prisma.chat.findUnique as jest.Mock).mockResolvedValue({
      id: 'chat-123',
      buyerId: 'user-1',
      sellerId: 'user-2',
    });

    const req = new NextRequest('http://localhost/api/chats/chat-123/messages', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello', senderId: 'user-3' }),
    });
    const res = await postMessage(req, { params: Promise.resolve({ id: 'chat-123' }) });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toContain('Forbidden');
  });

  it('creates message and notification when valid', async () => {
    (prisma.chat.findUnique as jest.Mock).mockResolvedValue({
      id: 'chat-123',
      buyerId: 'user-1',
      sellerId: 'user-2',
      buyer: { id: 'user-1', name: 'Buyer' },
      seller: { id: 'user-2', name: 'Seller' },
      listing: { id: 'l-1', title: 'Audi A4' },
    });

    const mockCreatedMessage = {
      id: 'msg-101',
      chatId: 'chat-123',
      senderId: 'user-1',
      content: 'Vai pieejams?',
      createdAt: new Date(),
      sender: { id: 'user-1', name: 'Buyer' },
    };
    (prisma.message.create as jest.Mock).mockResolvedValue(mockCreatedMessage);
    (prisma.notification.create as jest.Mock).mockResolvedValue({ id: 'notif-1' });

    const req = new NextRequest('http://localhost/api/chats/chat-123/messages', {
      method: 'POST',
      body: JSON.stringify({ content: 'Vai pieejams?', senderId: 'user-1' }),
    });
    const res = await postMessage(req, { params: Promise.resolve({ id: 'chat-123' }) });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message.content).toBe('Vai pieejams?');
    expect(prisma.message.create).toHaveBeenCalled();
  });
});

describe('GET /api/chats/[id]/messages', () => {
  it('returns messages array', async () => {
    const mockMessages = [
      { id: 'm-1', content: 'Ziņa 1', createdAt: new Date(), sender: { id: 'u-1', name: 'User 1' } },
      { id: 'm-2', content: 'Ziņa 2', createdAt: new Date(), sender: { id: 'u-2', name: 'User 2' } },
    ];
    (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

    const req = new NextRequest('http://localhost/api/chats/chat-123/messages');
    const res = await getMessages(req, { params: Promise.resolve({ id: 'chat-123' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.messages).toHaveLength(2);
  });
});
