"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { useMe } from "@/hooks/useMe";
import { getSocket } from "@/lib/socket/socket";

const socket = getSocket();

export default function MessageInput() {
  const { id } = useParams<{ id: string }>();

  const { user } = useMe();
  const { sendMessage, error: chatError } = useChat(id);

  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isTyping = useRef(false);

  const send = () => {
    if (!message.trim() || !user) return;

    try {
      sendMessage(message);

      setMessage("");
      setError(null);

      socket.emit("stop-typing", {
        conversationId: id,
        userId: user._id,
      });

      isTyping.current = false;
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message");
    }
  };

  const handleTyping = () => {
    if (!user) return;

    if (!isTyping.current) {
      socket.emit("typing", {
        conversationId: id,
        userId: user._id,
      });

      isTyping.current = true;
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop-typing", {
        conversationId: id,
        userId: user._id,
      });

      isTyping.current = false;
    }, 1000);
  };

  // Send message when Enter is pressed
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  return (
    <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center px-4 gap-3">

      <input
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 bg-gray-800 text-white placeholder-gray-400 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition"
      />

      <button
        onClick={send}
        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2 rounded-full font-medium transition"
      >
        Send
      </button>

      {(error || chatError) && (
        <p className="text-red-400 text-sm">
          {error || chatError}
        </p>
      )}

    </div>
  );
}