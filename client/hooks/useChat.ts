import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket/socket";
import { apiFetch } from "@/lib/api/client";
import { Message } from "@/types/message";

export function useChat(conversationId: string) {

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const socket = getSocket();

  useEffect(() => {

    async function loadMessages() {
      const data = await apiFetch<Message[]>(
        `/messages/${conversationId}`,
      );
      setMessages(data);
    }

    loadMessages();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-conversation", conversationId);

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
            !(m._id.startsWith("temp-") &&
              m.text === msg.text &&
              m.senderId === msg.senderId)
        );

        return [...withoutTemp, msg];

      });

    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);
    socket.on("new-message", handleMessage);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
      socket.off("new-message", handleMessage);

      socket.emit("leave-conversation", conversationId);
    };

  }, [conversationId, socket]);

  const sendMessage = (senderId: string, text: string) => {
    const tempMessage: Message = {
      _id: "temp-" + Date.now(),
      conversationId,
      senderId,
      text,
      createdAt: new Date().toISOString()
    };

    /* optimistic UI */

    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("send-message", {
      conversationId,
      senderId,
      text
    });
  };

  return { messages, sendMessage, typingUsers };
}