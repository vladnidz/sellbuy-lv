export interface ChatUser {
  id: string;
  name: string | null;
}

export interface ChatListing {
  id: string;
  title: string;
  price: number | string;
  images?: string[];
}

export interface MessageItem {
  id: string;
  content: string;
  createdAt: string | Date;
  senderId: string;
  sender?: ChatUser;
}

export interface ChatItem {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string | Date;
  buyer?: ChatUser;
  seller?: ChatUser;
  listing?: ChatListing;
  messages?: MessageItem[];
}

export interface InitiateChatRequest {
  listingId: string;
  buyerId: string;
  initialMessage?: string;
}

export interface InitiateChatResponse {
  chat: ChatItem;
  isNew: boolean;
  message?: MessageItem | null;
}
