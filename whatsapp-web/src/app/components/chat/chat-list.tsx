'use client';

import { BellOff, Pin } from "lucide-react";
import Image from "next/image";
import { formatChatTimestamp } from "../../lib/datetime";
import { cn } from "../../lib/utils";
import type { Chat } from "../../types/chat";
import { useChat } from "./chat-provider";
import { MessageStatusIcon } from "./message-status-icon";

type ChatListProps = {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
};

export const ChatList = ({ chats, onSelectChat }: ChatListProps) => {
  const { state, me } = useChat();

  if (!chats.length) {
    return (
      <div className="mt-12 flex flex-col items-center gap-2 px-6 text-center text-white/50">
        <p className="text-sm font-medium">No chats yet</p>
        <p className="text-xs text-white/40">
          Try updating your filters or starting a new conversation.
        </p>
      </div>
    );
  }

  return (
    <ul className="chat-scroll flex flex-col">
      {chats.map((chat) => {
        const isActive = state.activeChatId === chat.id;
        const counterpart = chat.participants.find(
          (participant) => participant.id !== me.id
        );

        return (
          <li key={chat.id}>
            <button
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition",
                isActive
                  ? "bg-emerald-500/20 text-white shadow-inner"
                  : "hover:bg-white/10"
              )}
            >
              <div className="relative h-12 w-12 shrink-0">
                {chat.isGroup ? (
                  <GroupAvatar participants={chat.participants} meId={me.id} />
                ) : (
                  <Image
                    src={counterpart?.avatar ?? me.avatar}
                    alt={chat.title}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                {chat.pinned && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500/20 p-1 text-emerald-200">
                    <Pin className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate text-sm font-semibold text-white/90">
                    {chat.title}
                  </p>
                  <span className="text-xs text-white/50">
                    {formatChatTimestamp(chat.lastActivity)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-white/60">
                    {chat.messages.length > 0 ? (
                      <>
                        {chat.messages.at(-1)?.direction === "outgoing" && (
                          <MessageStatusIcon
                            status={chat.messages.at(-1)!.status}
                            className="h-3.5 w-3.5"
                          />
                        )}
                        <span className="truncate">
                          {chat.lastMessagePreview}
                        </span>
                      </>
                    ) : (
                      <span>Say hi 👋</span>
                    )}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    {chat.muted && (
                      <BellOff className="h-3.5 w-3.5 text-white/40" />
                    )}
                    {chat.unreadCount > 0 && (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-emerald-50">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const GroupAvatar = ({
  participants,
  meId,
}: {
  participants: Chat["participants"];
  meId: string;
}) => {
  const others = participants.filter((participant) => participant.id !== meId);
  const avatars = others.slice(0, 2);

  return (
    <div className="relative h-12 w-12">
      {avatars.map((participant, index) => (
        <Image
          key={participant.id}
          src={participant.avatar}
          alt={participant.name}
          width={40}
          height={40}
          className={cn(
            "absolute h-9 w-9 rounded-full border-2 border-[#0a1014] object-cover",
            index === 0 ? "left-0 top-0" : "right-0 bottom-0"
          )}
        />
      ))}
      {others.length > 2 && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
          +{others.length - 2}
        </span>
      )}
    </div>
  );
};
