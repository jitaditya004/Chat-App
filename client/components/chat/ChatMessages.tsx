"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { useMe } from "@/hooks/useMe";
import { formatTime } from "@/lib/utils/formatTime";

export default function ChatMessages() {

  const { id } = useParams<{ id: string }>();
  const { user } = useMe();
  const { messages } = useChat(id);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-900">

      {messages.map((m) => {

        const pending = m._id.startsWith("temp-");
        const isMe = m.senderId === user?._id;

        return (
          <div
            key={m._id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
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

              <p className={`text-[10px] mt-1 ${
                isMe ? "text-blue-200" : "text-gray-400"
              } text-right`}>
                {formatTime(m.createdAt)}
              </p>

            </div>

          </div>
        );

      })}

      <div ref={bottomRef} />

    </div>
  );
}