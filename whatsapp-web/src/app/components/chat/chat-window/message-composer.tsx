'use client';

import { FormEvent, useRef, useState } from "react";
import { Mic, Paperclip, Send, SmilePlus } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Chat } from "../../../types/chat";
import { useChat } from "../chat-provider";

type Props = {
  chat: Chat;
};

export const MessageComposer = ({ chat }: Props) => {
  const { sendMessage } = useChat();
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.target.value);
    autoResize(event.target);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    sendMessage(chat.id, draft);
    setDraft("");
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as unknown as FormEvent);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 bg-[#1f2c34]/90 px-4 py-3 backdrop-blur"
    >
      <div className="flex items-end gap-3">
        <button
          type="button"
          className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
          aria-label="Add emoji"
        >
          <SmilePlus className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message"
          className="max-h-48 flex-1 resize-none rounded-3xl border border-white/5 bg-white/10 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
        />

        <button
          type={draft.trim() ? "submit" : "button"}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition",
            draft.trim()
              ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          )}
          aria-label={draft.trim() ? "Send message" : "Start voice message"}
        >
          {draft.trim() ? <Send className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
      </div>
    </form>
  );
};

const autoResize = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};
