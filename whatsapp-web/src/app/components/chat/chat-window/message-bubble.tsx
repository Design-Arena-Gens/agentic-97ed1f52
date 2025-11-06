'use client';

import { MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../../lib/utils";
import type { Message } from "../../../types/chat";
import { MessageStatusIcon } from "../message-status-icon";

type MessageBubbleProps = {
  message: Message;
  isGroupedWithPrevious: boolean;
  isLastInGroup: boolean;
};

export const MessageBubble = ({
  message,
  isGroupedWithPrevious,
  isLastInGroup,
}: MessageBubbleProps) => {
  const isOutgoing = message.direction === "outgoing";

  return (
    <div
      className={cn(
        "group relative max-w-[75%] rounded-3xl px-4 py-2 text-sm shadow-lg shadow-black/40",
        isOutgoing
          ? "ml-auto bg-gradient-to-br from-emerald-500/90 to-emerald-400/80 text-[#041b16]"
          : "bg-white/10 text-white/90",
        !isGroupedWithPrevious && (isOutgoing ? "rounded-tr-none" : "rounded-tl-none"),
        isOutgoing
          ? isLastInGroup
            ? "rounded-br-sm"
            : "rounded-br-3xl"
          : isLastInGroup
            ? "rounded-bl-sm"
            : "rounded-bl-3xl"
      )}
    >
      {message.replyTo && (
        <div className="mb-2 rounded-2xl border-l-4 border-emerald-400/60 bg-black/10 px-3 py-2 text-xs text-white/70">
          <p className="font-semibold text-white/80">Reply</p>
          <p className="line-clamp-1 text-white/60">{message.replyTo.preview}</p>
        </div>
      )}
      {message.attachments?.length ? (
        <div className="mb-2 space-y-2">
          {message.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
            >
              <div className="flex items-center gap-3 px-3 py-2">
                <MessageCircle className="h-4 w-4 text-white/60" />
                <div className="flex-1 text-xs text-white/70">
                  <p className="font-semibold text-white/90">
                    {attachment.name}
                  </p>
                  <p>{attachment.size}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <p className="whitespace-pre-line break-words leading-relaxed">
        {message.content}
      </p>
      <span className="mt-1 flex items-center justify-end gap-1 text-[10px] uppercase tracking-wide text-white/60">
        {format(new Date(message.timestamp), "HH:mm")}
        {isOutgoing && (
          <MessageStatusIcon status={message.status} className="h-3 w-3" />
        )}
      </span>
      {message.reactions && message.reactions.length > 0 && (
        <div className="mt-1 flex gap-1">
          {message.reactions.map((reaction, index) => (
            <span
              key={`${reaction.sender}-${index}`}
              className="rounded-full bg-black/20 px-2 py-1 text-xs"
            >
              {reaction.emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
