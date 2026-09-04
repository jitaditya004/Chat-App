"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { useMe } from "@/hooks/useMe";
import { formatTime } from "@/lib/utils/formatTime";
import { apiFetch } from "@/lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { Conversation } from "@/types/conversation";

export default function ChatMessages() {
  const { id } = useParams<{ id: string }>();

  const { user } = useMe();
  const {
    messages,
    // typingUsers,
    error: chatError,
  } = useChat(id);

  const [readError, setReadError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Mark conversation as read
  useEffect(() => {
    if (!id) return;

    async function markAsRead() {
      try {
        setReadError(null);

        await apiFetch(`/conversations/${id}/read`, {
          method: "POST",
        });

        queryClient.setQueryData<Conversation[]>(
          ["conversations"],
          (old = []) =>
            old.map((conversation) =>
              conversation._id === id
                ? { ...conversation, unread: 0 }
                : conversation
            )
        );

      } catch (err) {
        console.error(
          "Failed to mark conversation as read:",
          err
        );

        setReadError(
          "Failed to mark conversation as read"
        );
      }
    }

    markAsRead();
  }, [id, queryClient]);

  // Show loading/error state if messages failed to load
  if (chatError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <p className="text-red-400">
          {chatError}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-900">

      {/* Read error */}
      {readError && (
        <div className="text-center text-red-400 text-sm">
          {readError}
        </div>
      )}

      {messages.map((m) => {
        const pending = m._id.startsWith("temp-");
        const isMe = m.senderId === user?._id;

        return (
          <div
            key={m._id}
            className={`flex ${
              isMe ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                isMe
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-800 text-gray-100 rounded-bl-sm"
              } ${pending ? "opacity-60" : ""}`}
            >
              <p className="text-sm leading-relaxed wrap-break-words">
                {m.text}
              </p>

              <p
                className={`text-[10px] mt-1 ${
                  isMe ? "text-blue-200" : "text-gray-400"
                } text-right`}
              >
                {formatTime(m.createdAt)}
              </p>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
      {/* {typingUsers.length > 0 && (
        <div className="text-sm text-gray-400">
          User is typing...
        </div>
      )} */}

    </div>
  );
}