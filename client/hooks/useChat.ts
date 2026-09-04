import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket/socket";
import { apiFetch } from "@/lib/api/client";
import { Message } from "@/types/message";
import { useMe } from "@/hooks/useMe";

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socket = getSocket();
  const { user } = useMe();

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      try {
        setError(null);

        const data = await apiFetch<Message[]>(
          `/messages/${conversationId}`
        );

        if (!cancelled) {
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);

        if (!cancelled) {
          setError("Failed to load messages");
        }
      }
    }

    loadMessages();



    socket.emit("join-conversation", conversationId);

    // -----------------------------
    // Socket event handlers
    // -----------------------------

    const handleTyping = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    };

    const handleStopTyping = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) =>
        prev.filter((id) => id !== userId)
      );
    };

    const handleMessage = (msg: Message) => {
      setMessages((prev) => {
        const withoutTemp = prev.filter(
          (m) =>
            !(
              m._id.startsWith("temp-") &&
              m.text === msg.text &&
              m.senderId === msg.senderId
            )
        );

        return [...withoutTemp, msg];
      });
    };

    // Socket errors
    const handleConnectError = (err: Error) => {
      console.error("Socket connection error:", err);
      setError("Unable to connect to chat server");
    };

    const handleSocketError = (err: Error) => {
      console.error("Socket error:", err);
      setError("Chat connection error");
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);
    socket.on("new-message", handleMessage);

    socket.on("connect_error", handleConnectError);
    socket.on("error", handleSocketError);

    return () => {
      cancelled = true;

      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
      socket.off("new-message", handleMessage);

      socket.off("connect_error", handleConnectError);
      socket.off("error", handleSocketError);

      socket.emit("leave-conversation", conversationId);
    };
  }, [conversationId, socket]);

  const sendMessage = (text: string) => {
    if (!text.trim() || !user) return;

    const tempMessage: Message = {
      _id: "temp-" + Date.now(),
      conversationId,
      senderId: user._id,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("send-message", {
      conversationId,
      text,
    });
  };

  return {
    messages,
    sendMessage,
    typingUsers,
    error,
  };
}