'use client';

import { useMemo } from "react";
import { cn } from "../../lib/utils";
import { useChat } from "./chat-provider";
import { Sidebar } from "./sidebar";
import { ChatWindow } from "./chat-window";

export const ChatLayout = () => {
  const { activeChat } = useChat();
  const showSidebarOnMobile = useMemo(() => !activeChat, [activeChat]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-2 py-6 sm:px-6 lg:px-12">
      <div className="glass-surface flex h-[calc(100vh-3rem)] w-full max-w-[1200px] overflow-hidden rounded-[32px] border border-white/10">
        <Sidebar className={showSidebarOnMobile ? "" : "hidden lg:flex"} />
        <div
          className={cn(
            "flex flex-1",
            showSidebarOnMobile ? "hidden lg:flex" : "flex"
          )}
        >
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};
