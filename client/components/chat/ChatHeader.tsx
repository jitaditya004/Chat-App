"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { useChat } from "@/hooks/useChat";

type Conversation = {
  otherUser: {
    _id: string;
    username: string;
  };
};

export default function ChatHeader({ openMenu }: { openMenu: () => void }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const { typingUsers } = useChat(id);
  const onlineUsers = useOnlineUsers();

  useEffect(() => {
    async function loadConversation() {
      const data = await apiFetch<Conversation>(`/conversations/${id}`);
      setConversation(data);
    }

    loadConversation();
  }, [id]);

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const otherUserId = conversation?.otherUser._id ?? "";

  const isTyping = typingUsers.includes(otherUserId);
  const isOnline = onlineUsers.includes(otherUserId);

  return (
    <div className="h-16 bg-linear-to-r from-gray-900 to-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shadow-sm">

      <div className="flex items-center">

        <button
          onClick={openMenu}
          className="md:hidden mr-3 text-xl text-gray-200"
        >
          ☰
        </button>

        <div className="flex items-center gap-3">

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
              {conversation?.otherUser.username?.[0]?.toUpperCase()}
            </div>

            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
            )}
          </div>

          <div className="flex flex-col">
            <p className="font-semibold text-white leading-none">
              {conversation?.otherUser.username}
            </p>

            <p className="text-xs text-gray-300 mt-1">
              {isTyping
                ? "typing..."
                : isOnline
                ? "Active now"
                : "Offline"}
            </p>
          </div>

        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-lg transition"
      >
        Logout
      </button>

    </div>
  );
}