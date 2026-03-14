"use client";

import type { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-brand-600 text-white rounded-tr-sm"
            : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-sm"
        }`}
      >
        {message.content}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-slate-400 animate-pulse rounded-sm align-middle" />
        )}
      </div>
    </div>
  );
}
