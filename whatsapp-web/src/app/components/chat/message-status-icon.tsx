'use client';

import { Check, CheckCheck, Clock, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import type { MessageStatus } from "../../types/chat";

type Props = {
  status: MessageStatus;
  className?: string;
};

export const MessageStatusIcon = ({ status, className }: Props) => {
  switch (status) {
    case "sent":
      return (
        <Check
          className={cn("h-4 w-4 text-emerald-200/80", className)}
          aria-label="Sent"
        />
      );
    case "delivered":
      return (
        <CheckCheck
          className={cn("h-4 w-4 text-emerald-200/80", className)}
          aria-label="Delivered"
        />
      );
    case "read":
      return (
        <CheckCheck
          className={cn("h-4 w-4 text-sky-400", className)}
          aria-label="Read"
        />
      );
    case "failed":
      return (
        <XCircle
          className={cn("h-4 w-4 text-red-400", className)}
          aria-label="Failed"
        />
      );
    default:
      return (
        <Clock
          className={cn("h-4 w-4 text-white/40", className)}
          aria-label="Pending"
        />
      );
  }
};
