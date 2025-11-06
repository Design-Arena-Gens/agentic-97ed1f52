'use client';

import { useMemo } from "react";
import { useChat } from "./chat-provider";
import { EmptyChatState } from "./empty-chat-state";
import { ChatHeader } from "./chat-window/header";
import { MessageList } from "./chat-window/message-list";
import { MessageComposer } from "./chat-window/message-composer";

export const ChatWindow = () => {
  const { activeChat } = useChat();
  const hasActiveChat = useMemo(() => Boolean(activeChat), [activeChat]);

  return (
    <section className="relative flex flex-1 flex-col bg-[#0b141a]/80">
      {hasActiveChat && activeChat ? (
        <>
          <ChatHeader chat={activeChat} />
          <MessageList chat={activeChat} />
          <MessageComposer key={activeChat.id} chat={activeChat} />
        </>
      ) : (
        <EmptyChatState />
      )}
    </section>
  );
};
