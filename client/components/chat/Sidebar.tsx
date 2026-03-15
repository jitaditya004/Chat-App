"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { Conversation } from "@/types/conversation";

type User = {
  _id: string;
  username: string;
};

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [me, setMe] = useState<User | null>(null);

  const router = useRouter();

  // const loadMe = async () => {
  //   const data = await apiFetch<User>("/users/me");
  //   setMe(data);
  // };

  const loadConversations = async () => {
    const data = await apiFetch<Conversation[]>("/conversations");
    setConversations(data);
  };

  useEffect(() => {
    async function load() {
      const [meData, convoData] = await Promise.all([
        apiFetch<User>("/users/me"),
        apiFetch<Conversation[]>("/conversations"),
      ]);

      setMe(meData);
      setConversations(convoData);
    }

    load();
  }, []);

  const search = async (q: string) => {
    setQuery(q);

    if (q.length < 1) {
      setResults([]);
      return;
    }

    const users = await apiFetch<User[]>(`/users/search?q=${q}`);
    setResults(users);
  };

  const startChat = async (userId: string) => {
    const convo = await apiFetch<{ conversation: { _id: string } }>(
      "/conversations/start",
      {
        method: "POST",
        body: { userId }
      }
    );

    router.push(`/chat/${convo.conversation._id}`);
    loadConversations();
  };

  const openConversation = (id: string) => {
    router.push(`/chat/${id}`);
  };

  return (
    <div className="w-72 bg-gray-950 border-r border-gray-800 flex flex-col text-white">

      {/* Header */}
      <div className="p-4 border-b border-gray-800">

        <h2 className="font-semibold text-lg">Chats</h2>

        {me && (
          <p className="text-xs text-gray-400 mt-1">
            Logged in as {me.username}
          </p>
        )}

        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Search users..."
          className="mt-3 w-full bg-gray-800 text-sm text-white placeholder-gray-400 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Search results */}
        {results.map((u) => (
          <div
            key={u._id}
            onClick={() => startChat(u._id)}
            className="flex items-center gap-3 p-3 hover:bg-gray-900 cursor-pointer transition"
          >
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold">
              {u.username[0].toUpperCase()}
            </div>

            <p className="text-sm">{u.username}</p>
          </div>
        ))}

        {/* Conversations */}
        {conversations.map((c) => (
          <div
            key={c._id}
            onClick={() => openConversation(c._id)}
            className="flex items-center gap-3 p-3 hover:bg-gray-900 cursor-pointer transition border-t border-gray-800"
          >

            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-semibold">
              {c.otherUser.username[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">

              <p className="text-sm font-medium truncate">
                {c.otherUser.username}
              </p>

              {c.lastMessage && (
                <p className="text-xs text-gray-400 truncate">
                  {c.lastMessage}
                </p>
              )}

            </div>

            {c.unread > 0 && (
              <div className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                {c.unread}
              </div>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}