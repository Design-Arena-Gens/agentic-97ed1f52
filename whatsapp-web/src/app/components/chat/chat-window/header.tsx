'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  Bell,
  BellOff,
  ChevronLeft,
  MoreHorizontal,
  Phone,
  Pin,
  PinOff,
  Search,
  Users,
  Video,
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import Image from "next/image";
import { cn } from "../../../lib/utils";
import type { Chat } from "../../../types/chat";
import { useChat } from "../chat-provider";

type Props = {
  chat: Chat;
};

export const ChatHeader = ({ chat }: Props) => {
  const { me, setActiveChat, toggleMute, togglePinned, archiveChat } = useChat();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const counterpart = useMemo(
    () => chat.participants.find((participant) => participant.id !== me.id),
    [chat.participants, me.id]
  );

  const presence = useMemo(() => {
    if (chat.isGroup) {
      return `${chat.participants.length} participants`;
    }
    if (!counterpart) return "";
    if (counterpart.isOnline) {
      return "online";
    }
    const lastSeen = counterpart?.lastSeen
      ? new Date(counterpart.lastSeen)
      : undefined;
    if (!lastSeen) return "";
    return `last seen ${formatDistanceToNowStrict(lastSeen, {
      addSuffix: true,
    })}`;
  }, [chat.isGroup, chat.participants, counterpart]);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#1f2c34]/80 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          className="inline-flex rounded-full p-2 text-white/60 transition hover:bg-white/10 lg:hidden"
          onClick={() => setActiveChat(null)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
          {chat.isGroup ? (
            <GroupCollage chat={chat} activeUserId={me.id} />
          ) : (
            <Image
              src={counterpart?.avatar ?? me.avatar}
              alt={chat.title}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white/90">{chat.title}</p>
          <p className="text-xs capitalize text-white/50">{presence}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-white/60">
        <button
          className="rounded-full p-2 transition hover:bg-white/10"
          aria-label="Search in conversation"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          className="rounded-full p-2 transition hover:bg-white/10"
          aria-label="Start voice call"
        >
          <Phone className="h-5 w-5" />
        </button>
        <button
          className="rounded-full p-2 transition hover:bg-white/10"
          aria-label="Start video call"
        >
          <Video className="h-5 w-5" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            className={cn(
              "rounded-full p-2 transition hover:bg-white/10",
              menuOpen && "bg-white/10 text-white"
            )}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-2xl border border-white/5 bg-[#1f2c34] p-1 text-sm text-white/80 shadow-xl">
              <MenuItem
                icon={chat.pinned ? PinOff : Pin}
                label={chat.pinned ? "Unpin chat" : "Pin chat"}
                onClick={() => {
                  togglePinned(chat.id);
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={chat.muted ? Bell : BellOff}
                label={chat.muted ? "Unmute notifications" : "Mute notifications"}
                onClick={() => {
                  toggleMute(chat.id);
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={Users}
                label="View participants"
                onClick={() => {
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={MoreHorizontal}
                label={chat.archived ? "Move to inbox" : "Archive chat"}
                onClick={() => {
                  archiveChat(chat.id, !chat.archived);
                  setMenuOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const MenuItem = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) => (
  <button
    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-white/70 hover:bg-white/10"
    onClick={onClick}
  >
    <Icon className="h-4 w-4 text-white/50" />
    <span>{label}</span>
  </button>
);

const GroupCollage = ({
  chat,
  activeUserId,
}: {
  chat: Chat;
  activeUserId: string;
}) => {
  const others = chat.participants.filter(
    (participant) => participant.id !== activeUserId
  );
  const avatars = others.slice(0, 3);

  return (
    <div className="relative h-12 w-12">
      <div className="absolute inset-0 rounded-full bg-emerald-500/20" />
      {avatars.map((participant, index) => {
        const positions = [
          "left-0 top-0",
          "right-0 top-0",
          "left-1/2 bottom-0 -translate-x-1/2",
        ] as const;
        return (
          <Image
            key={participant.id}
            src={participant.avatar}
            alt={participant.name}
            width={36}
            height={36}
            className={cn(
              "absolute h-9 w-9 rounded-full border-2 border-[#1f2c34] object-cover shadow",
              positions[index] ?? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            )}
          />
        );
      })}
      {others.length > 3 && (
        <div className="absolute -bottom-1 right-0 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          +{others.length - 3}
        </div>
      )}
    </div>
  );
};
