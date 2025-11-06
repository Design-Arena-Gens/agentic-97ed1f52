'use client';

import { useMemo, useState } from "react";
import {
  ArchiveRestore,
  CircleDashed,
  Filter,
  MessageSquarePlus,
  MoreHorizontal,
  Search,
} from "lucide-react";
import Image from "next/image";
import { cn } from "../../lib/utils";
import { useChat } from "./chat-provider";
import { ChatList } from "./chat-list";
import { NewChatSheet } from "./new-chat-sheet";

const FILTERS = [
  { id: "all", label: "All chats" },
  { id: "unread", label: "Unread" },
  { id: "groups", label: "Groups" },
  { id: "pinned", label: "Pinned" },
] as const;

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps = {}) => {
  const {
    me,
    state,
    visibleChats,
    setActiveChat,
    setSearchTerm,
    setFilter,
  } = useChat();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const archivedCount = useMemo(
    () => state.chats.filter((chat) => chat.archived).length,
    [state.chats]
  );

  return (
    <aside
      className={cn(
        "relative flex w-full flex-col border-r border-white/10 bg-white/5 backdrop-blur lg:max-w-[360px]",
        className
      )}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/20">
            <Image
              src={me.avatar}
              alt={me.name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0a1014] bg-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">{me.name}</p>
            <p className="text-xs text-white/50">{me.about}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-white/60">
          <button
            className="rounded-full p-2 transition hover:bg-white/10"
            aria-label="Open status updates"
          >
            <CircleDashed className="h-5 w-5" />
          </button>
          <button
            className="rounded-full p-2 transition hover:bg-white/10"
            aria-label="Start a new chat"
            onClick={() => setIsCreatingChat(true)}
          >
            <MessageSquarePlus className="h-5 w-5" />
          </button>
          <button
            className="rounded-full p-2 transition hover:bg-white/10"
            aria-label="More options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={state.searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search or start new chat"
            className="w-full rounded-full border border-white/5 bg-white/10 py-2 pl-11 pr-4 text-sm text-white/90 placeholder:text-white/40 focus:border-emerald-400/70 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-4">
        <div className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-white/60">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">
            Filters
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = state.filter === filter.id;
            return (
              <button
                key={filter.id}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/90"}`}
                onClick={() => setFilter(filter.id)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {archivedCount > 0 && (
        <button
          className={cn(
            "mx-4 mt-3 flex items-center justify-between rounded-xl border border-white/5 px-4 py-3 text-sm transition",
            state.filter === "archived"
              ? "bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white/10 text-white/70 hover:bg-white/15"
          )}
          onClick={() =>
            setFilter(state.filter === "archived" ? "all" : "archived")
          }
        >
          <span className="flex items-center gap-3 font-medium">
            <ArchiveRestore className="h-4 w-4 text-emerald-300/80" />
            Archived
          </span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs">
            {archivedCount}
          </span>
        </button>
      )}

      <div className="mt-3 flex-1 overflow-y-auto pb-4">
        <ChatList chats={visibleChats} onSelectChat={setActiveChat} />
      </div>

      <NewChatSheet open={isCreatingChat} onOpenChange={setIsCreatingChat} />
    </aside>
  );
};
