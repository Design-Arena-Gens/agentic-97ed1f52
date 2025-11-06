'use client';

import { useEffect, useMemo, useRef } from "react";
import { differenceInMinutes } from "date-fns";
import type { Chat, Message } from "../../../types/chat";
import { formatChatDay } from "../../../lib/datetime";
import { MessageBubble } from "./message-bubble";

type Props = {
  chat: Chat;
};

export const MessageList = ({ chat }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer) return;
    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [chat.messages]);

  const timeline = useMemo(
    () => groupMessagesByDay(chat.messages),
    [chat.messages]
  );

  return (
    <div
      ref={containerRef}
      className="chat-scroll relative flex h-full flex-1 flex-col gap-4 overflow-y-auto bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=60')] bg-cover bg-center px-5 py-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
      <div className="relative z-10 flex flex-col gap-5">
        {timeline.map(({ dayLabel, messages }) => (
          <div key={dayLabel} className="flex flex-col gap-3">
            <DayDivider label={dayLabel} />
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const isGroupedWithPrevious = shouldGroupWithPrevious(
                previous,
                message
              );
              const next = messages[index + 1];
              const isLastInGroup =
                !next ||
                next.direction !== message.direction ||
                differenceInMinutes(
                  new Date(next.timestamp),
                  new Date(message.timestamp)
                ) > 5;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isGroupedWithPrevious={isGroupedWithPrevious}
                  isLastInGroup={isLastInGroup}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div ref={scrollAnchorRef} />
    </div>
  );
};

const groupMessagesByDay = (messages: Message[]) => {
  const groups: Array<{ dayLabel: string; messages: Message[] }> = [];
  let currentDay = "";

  messages.forEach((message) => {
    const label = formatChatDay(message.timestamp);
    if (label !== currentDay) {
      groups.push({ dayLabel: label, messages: [message] });
      currentDay = label;
    } else {
      groups[groups.length - 1]?.messages.push(message);
    }
  });

  return groups;
};

const DayDivider = ({ label }: { label: string }) => (
  <div className="flex justify-center">
    <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] uppercase tracking-wide text-white/70">
      {label}
    </span>
  </div>
);

const shouldGroupWithPrevious = (
  previous: Message | undefined,
  current: Message
) => {
  if (!previous) return false;
  if (previous.direction !== current.direction) return false;
  return (
    differenceInMinutes(
      new Date(current.timestamp),
      new Date(previous.timestamp)
    ) <= 5
  );
};
