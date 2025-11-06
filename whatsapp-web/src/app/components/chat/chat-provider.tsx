'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { addSeconds } from "date-fns";
import { v4 as uuid } from "uuid";
import {
  currentUser,
  sampleChats,
  sampleContacts,
} from "../../data/sample-chats";
import type {
  Chat,
  ChatFilter,
  ChatContact,
  Message,
  MessageStatus,
} from "../../types/chat";

type ChatState = {
  chats: Chat[];
  activeChatId: string | null;
  filter: ChatFilter;
  searchTerm: string;
};

type ReducerAction =
  | { type: "SET_ACTIVE_CHAT"; chatId: string | null }
  | { type: "SET_SEARCH"; term: string }
  | { type: "SET_FILTER"; filter: ChatFilter }
  | { type: "SEND_MESSAGE"; chatId: string; message: Message }
  | {
      type: "RECEIVE_MESSAGE";
      chatId: string;
      message: Message;
      isActive: boolean;
    }
  | {
      type: "UPDATE_STATUS";
      chatId: string;
      messageId: string;
      status: MessageStatus;
    }
  | { type: "CREATE_CHAT"; chat: Chat }
  | { type: "TOGGLE_PIN"; chatId: string }
  | { type: "TOGGLE_MUTE"; chatId: string }
  | { type: "ARCHIVE_CHAT"; chatId: string; archived: boolean }
  | { type: "MARK_CHAT_READ"; chatId: string };

const STORAGE_KEY = "whatsapp-web-clone-state";

const sortChats = (chats: Chat[]): Chat[] => {
  return [...chats].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  });
};

const reducer = (state: ChatState, action: ReducerAction): ChatState => {
  switch (action.type) {
    case "SET_ACTIVE_CHAT": {
      const { chatId } = action;
      return {
        ...state,
        activeChatId: chatId,
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                unreadCount: 0,
              }
            : chat
        ),
      };
    }
    case "SET_SEARCH":
      return { ...state, searchTerm: action.term };
    case "SET_FILTER":
      return { ...state, filter: action.filter };
    case "SEND_MESSAGE": {
      const updated = state.chats.map((chat) =>
        chat.id === action.chatId
          ? {
              ...chat,
              messages: [...chat.messages, action.message],
              lastActivity: action.message.timestamp,
              lastMessagePreview: action.message.content,
              unreadCount: 0,
            }
          : chat
      );
      return { ...state, chats: sortChats(updated) };
    }
    case "RECEIVE_MESSAGE": {
      const updated = state.chats.map((chat) =>
        chat.id === action.chatId
          ? {
              ...chat,
              messages: [...chat.messages, action.message],
              lastActivity: action.message.timestamp,
              lastMessagePreview: action.message.content,
              unreadCount: action.isActive ? 0 : chat.unreadCount + 1,
            }
          : chat
      );
      return { ...state, chats: sortChats(updated) };
    }
    case "UPDATE_STATUS": {
      const updated = state.chats.map((chat) =>
        chat.id === action.chatId
          ? {
              ...chat,
              messages: chat.messages.map((message) =>
                message.id === action.messageId
                  ? { ...message, status: action.status }
                  : message
              ),
            }
          : chat
      );
      return { ...state, chats: updated };
    }
    case "CREATE_CHAT": {
      return {
        ...state,
        chats: sortChats([action.chat, ...state.chats]),
        activeChatId: action.chat.id,
      };
    }
    case "TOGGLE_PIN": {
      const updated = state.chats.map((chat) =>
        chat.id === action.chatId ? { ...chat, pinned: !chat.pinned } : chat
      );
      return { ...state, chats: sortChats(updated) };
    }
    case "TOGGLE_MUTE": {
      const updated = state.chats.map((chat) =>
        chat.id === action.chatId ? { ...chat, muted: !chat.muted } : chat
      );
      return { ...state, chats: updated };
    }
    case "ARCHIVE_CHAT": {
      const updated = state.chats.map((chat) =>
        chat.id === action.chatId ? { ...chat, archived: action.archived } : chat
      );
      return { ...state, chats: updated };
    }
    case "MARK_CHAT_READ": {
      const updated = state.chats.map((chat) =>
        chat.id === action.chatId ? { ...chat, unreadCount: 0 } : chat
      );
      return { ...state, chats: updated };
    }
    default:
      return state;
  }
};

type ChatContextValue = {
  state: ChatState;
  me: ChatContact;
  contacts: ChatContact[];
  activeChat: Chat | undefined;
  visibleChats: Chat[];
  setActiveChat: (chatId: string | null) => void;
  setSearchTerm: (term: string) => void;
  setFilter: (filter: ChatFilter) => void;
  togglePinned: (chatId: string) => void;
  toggleMute: (chatId: string) => void;
  archiveChat: (chatId: string, archived: boolean) => void;
  sendMessage: (chatId: string, content: string) => void;
  startChat: (contact: ChatContact) => Chat;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const loadState = (): ChatState | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ChatState) : null;
  } catch (error) {
    console.warn("Failed to parse chat state from storage", error);
    return null;
  }
};

const persistState = (state: ChatState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist chat state", error);
  }
};

const createEmptyChat = (contact: ChatContact, meContact: ChatContact): Chat => ({
  id: `chat-${contact.id}`,
  title: contact.name,
  isGroup: false,
  participants: [meContact, contact],
  unreadCount: 0,
  muted: false,
  pinned: false,
  archived: false,
  lastActivity: new Date().toISOString(),
  lastMessagePreview: "Say hi 👋",
  messages: [],
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    if (typeof window !== "undefined") {
      const restored = loadState();
      if (restored) {
        return {
          ...restored,
          chats: sortChats(restored.chats),
        };
      }
    }
    return {
      chats: sortChats(sampleChats),
      activeChatId: sampleChats[0]?.id ?? null,
      filter: "all" as ChatFilter,
      searchTerm: "",
    };
  });
  const statusTimers = useRef<Record<string, NodeJS.Timeout[]>>({});
  const replyTimers = useRef<Record<string, NodeJS.Timeout | undefined>>({});

  useEffect(() => {
    persistState(state);
  }, [state]);

  useEffect(() => {
    const statusRefs = statusTimers.current;
    const replyRefs = replyTimers.current;
    return () => {
      Object.values(statusRefs).forEach((timers) =>
        timers.forEach((timeout) => clearTimeout(timeout))
      );
      Object.values(replyRefs).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const setActiveChat = useCallback((chatId: string | null) => {
    dispatch({ type: "SET_ACTIVE_CHAT", chatId });
    if (chatId) {
      dispatch({ type: "MARK_CHAT_READ", chatId });
    }
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH", term });
  }, []);

  const setFilter = useCallback((filter: ChatFilter) => {
    dispatch({ type: "SET_FILTER", filter });
  }, []);

  const togglePinned = useCallback((chatId: string) => {
    dispatch({ type: "TOGGLE_PIN", chatId });
  }, []);

  const toggleMute = useCallback((chatId: string) => {
    dispatch({ type: "TOGGLE_MUTE", chatId });
  }, []);

  const archiveChat = useCallback((chatId: string, archived: boolean) => {
    dispatch({ type: "ARCHIVE_CHAT", chatId, archived });
  }, []);

  const startChat = useCallback(
    (contact: ChatContact) => {
      const already =
        state.chats.find((chat) => chat.id === `chat-${contact.id}`) ?? null;
      if (already) {
        setActiveChat(already.id);
        return already;
      }
      const chat = createEmptyChat(contact, currentUser);
      dispatch({ type: "CREATE_CHAT", chat });
      return chat;
    },
    [setActiveChat, state.chats]
  );

  const scheduleStatusUpdates = useCallback(
    (chatId: string, message: Message) => {
      const timers: NodeJS.Timeout[] = [];

      timers.push(
        setTimeout(() => {
          dispatch({
            type: "UPDATE_STATUS",
            chatId,
            messageId: message.id,
            status: "delivered",
          });
        }, 1000)
      );

      timers.push(
        setTimeout(() => {
          dispatch({
            type: "UPDATE_STATUS",
            chatId,
            messageId: message.id,
            status: "read",
          });
        }, 2000)
      );

      statusTimers.current[message.id] = timers;
    },
    []
  );

  const scheduleAutoReply = useCallback(
    (chat: Chat, lastMessage: Message) => {
      if (chat.isGroup) return;
      const delay = 4000 + Math.random() * 4000;
      const timer = setTimeout(() => {
        const reply = {
          id: uuid(),
          direction: "incoming" as const,
          type: "text" as const,
          content: generateSmartReply(chat, lastMessage.content),
          timestamp: addSeconds(new Date(), 1).toISOString(),
          status: "delivered" as const,
        };
        dispatch({
          type: "RECEIVE_MESSAGE",
          chatId: chat.id,
          message: reply,
          isActive: state.activeChatId === chat.id,
        });
      }, delay);
      replyTimers.current[chat.id] = timer;
    },
    [state.activeChatId]
  );

  const sendMessage = useCallback(
    (chatId: string, content: string) => {
      const sanitized = content.trim();
      if (!sanitized) return;

      const message: Message = {
        id: uuid(),
        direction: "outgoing",
        type: "text",
        content: sanitized,
        timestamp: new Date().toISOString(),
        status: "sent",
      };

      dispatch({ type: "SEND_MESSAGE", chatId, message });
      scheduleStatusUpdates(chatId, message);

      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        scheduleAutoReply(chat, message);
      }
    },
    [scheduleStatusUpdates, state.chats, scheduleAutoReply]
  );

  const visibleChats = useMemo(() => {
    return state.chats.filter((chat) => {
      if (state.filter === "archived") {
        return chat.archived;
      }

      if (chat.archived) return false;

      if (state.filter === "pinned" && !chat.pinned) {
        return false;
      }

      if (state.filter === "unread" && chat.unreadCount === 0) {
        return false;
      }

      if (state.filter === "groups" && !chat.isGroup) {
        return false;
      }

      if (!state.searchTerm) return true;
      const term = state.searchTerm.toLowerCase();
      return (
        chat.title.toLowerCase().includes(term) ||
        chat.lastMessagePreview.toLowerCase().includes(term)
      );
    });
  }, [state.chats, state.filter, state.searchTerm]);

  const activeChat = useMemo(
    () => state.chats.find((chat) => chat.id === state.activeChatId),
    [state.activeChatId, state.chats]
  );

  const value: ChatContextValue = {
    state,
    me: currentUser,
    contacts: sampleContacts,
    activeChat,
    visibleChats,
    setActiveChat,
    setSearchTerm,
    setFilter,
    togglePinned,
    toggleMute,
    archiveChat,
    sendMessage,
    startChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

const smartReplies = [
  "Sounds good!",
  "Let me check and get back to you.",
  "Perfect, thanks for the update.",
  "I'll take a look shortly.",
];

const generateSmartReply = (chat: Chat, lastMessage: string) => {
  if (lastMessage.includes("?")) {
    return "Let me think about that for a moment.";
  }
  if (lastMessage.toLowerCase().includes("thanks")) {
    return "Anytime!";
  }
  if (chat.title === "Product Studio") {
    return "Adding it to the board now.";
  }
  return smartReplies[Math.floor(Math.random() * smartReplies.length)];
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
};
