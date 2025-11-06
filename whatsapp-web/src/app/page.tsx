'use client';

import { ChatProvider } from "./components/chat/chat-provider";
import { ChatLayout } from "./components/chat/chat-layout";

export default function Page() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
}
