'use client';

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { useChat } from "./chat-provider";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const NewChatSheet = ({ open, onOpenChange }: Props) => {
  const { contacts, startChat, me } = useChat();
  const [query, setQuery] = useState("");

  const filteredContacts = useMemo(() => {
    if (!query) return contacts;
    const term = query.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.id !== me.id &&
        (contact.name.toLowerCase().includes(term) ||
          contact.phone.toLowerCase().includes(term))
    );
  }, [contacts, me.id, query]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30 flex">
      <button
        className="h-full w-full bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-label="Close new chat"
      />
      <div className="relative flex h-full w-[320px] flex-col border-l border-white/10 bg-[#0c1317] px-4 pb-6 pt-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white/90">
            Start new chat
          </h2>
          <button
            className="rounded-full p-1.5 text-white/60 hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-white/40">
          Select a contact to begin chatting.
        </p>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contacts"
              className="w-full rounded-full border border-white/5 bg-white/10 py-2 pl-11 pr-4 text-sm text-white/90 placeholder:text-white/40 focus:border-emerald-400/70 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>
        </div>

        <ul className="chat-scroll mt-5 flex-1 space-y-2 overflow-y-auto pr-1">
          {filteredContacts.map((contact) => (
            <li key={contact.id}>
              <button
                className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-left text-white/80 transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
                onClick={() => {
                  startChat(contact);
                  onOpenChange(false);
                }}
              >
                <Image
                  src={contact.avatar}
                  alt={contact.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-white/90">
                    {contact.name}
                  </p>
                  <p className="text-xs text-white/50">{contact.about}</p>
                </div>
              </button>
            </li>
          ))}
          {filteredContacts.length === 0 && (
            <li className="py-10 text-center text-sm text-white/40">
              No contacts found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
