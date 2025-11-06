export type MessageDirection = "incoming" | "outgoing";

export type MessageStatus = "sent" | "delivered" | "read" | "failed";

export type MessageType =
  | "text"
  | "image"
  | "voice"
  | "audio"
  | "document"
  | "video"
  | "sticker"
  | "location"
  | "contact";

export interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
  thumbnail?: string;
  type: Extract<MessageType, "image" | "document" | "video" | "audio">;
}

export interface Message {
  id: string;
  direction: MessageDirection;
  type: MessageType;
  content: string;
  timestamp: string;
  status: MessageStatus;
  attachments?: Attachment[];
  replyTo?: {
    id: string;
    preview: string;
  };
  starred?: boolean;
  reactions?: Array<{
    emoji: string;
    sender: string;
  }>;
}

export interface ChatContact {
  id: string;
  name: string;
  phone: string;
  about: string;
  avatar: string;
  lastSeen: string;
  isOnline: boolean;
}

export interface Chat {
  id: string;
  title: string;
  isGroup: boolean;
  participants: ChatContact[];
  unreadCount: number;
  muted: boolean;
  pinned: boolean;
  archived: boolean;
  lastActivity: string;
  lastMessagePreview: string;
  wallpaper?: string;
  messages: Message[];
}

export type ChatFilter = "all" | "unread" | "groups" | "pinned" | "archived";
