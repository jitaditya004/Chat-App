"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Conversation } from "@/types/conversation";
import { getSocket } from "@/lib/socket/socket";
import { Message } from "@/types/message";

type User = {
  _id: string;
  username: string;
};

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [startChatError, setStartChatError] = useState<string | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();
  const socket = getSocket();

  // Current user
  const {
    data: me,
    isLoading: meLoading,
    error: meError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<User>("/users/me"),
  });

  // Conversations
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      apiFetch<Conversation[]>("/conversations"),
  });

  // useEffect(() => {
  //   if (!me) return;

  //   const handleNewMessage = (msg: Message) => {
  //     queryClient.setQueryData<Conversation[]>(
  //       ["conversations"],
  //       (old = []) => {
  //         const conversation = old.find(
  //           (c) => c._id === msg.conversationId
  //         );

  //         if (!conversation) {
  //           return old;
  //         }

  //         const isOwnMessage =
  //           msg.senderId === me._id;

  //         const updatedConversation: Conversation = {
  //           ...conversation,
  //           lastMessage: msg.text,
  //           unread: isOwnMessage
  //             ? conversation.unread
  //             : conversation.unread + 1,
  //         };

  //         return [
  //           updatedConversation,
  //           ...old.filter(
  //             (c) => c._id !== msg.conversationId
  //           ),
  //         ];
  //       }
  //     );
  //   };

  //   socket.on("new-message", handleNewMessage);

  //   return () => {
  //     socket.off("new-message", handleNewMessage);
  //   };
  // }, [socket, queryClient, me]);


  useEffect(() => {
    const handleNewMessage = () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, queryClient]);


  useEffect(() => {
    console.log("Conversations:", conversations);
  }, [conversations]);

  // // Mark as read
  // const markAsRead = useMutation({
  //   mutationFn: (conversationId: string) =>
  //     apiFetch(`/conversations/${conversationId}/read`, {
  //       method: "POST",
  //     }),

  //   onMutate: async (conversationId) => {
  //     await queryClient.cancelQueries({
  //       queryKey: ["conversations"],
  //     });

  //     const prev =
  //       queryClient.getQueryData<Conversation[]>(
  //         ["conversations"]
  //       );

  //     queryClient.setQueryData<Conversation[]>(
  //       ["conversations"],
  //       (old = []) =>
  //         old.map((c) =>
  //           c._id === conversationId
  //             ? { ...c, unread: 0 }
  //             : c
  //         )
  //     );

  //     return { prev };
  //   },

  //   onError: (err, _id, context) => {
  //     console.error("Failed to mark conversation as read:", err);

  //     if (context?.prev) {
  //       queryClient.setQueryData(
  //         ["conversations"],
  //         context.prev
  //       );
  //     }
  //   },

  //   onSettled: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["conversations"],
  //     });
  //   },
  // });

  const openConversation = (id: string) => {
    setStartChatError(null);

    // Immediately update Sidebar UI
    queryClient.setQueryData<Conversation[]>(
      ["conversations"],
      (old = []) =>
        old.map((conversation) =>
          conversation._id === id
            ? { ...conversation, unread: 0 }
            : conversation
        )
    );

    router.push(`/chat/${id}`);
  };

  // Search users
  const search = async (q: string) => {
    setQuery(q);
    setSearchError(null);

    if (!q.trim()) {
      setResults([]);
      return;
    }

    try {
      const users = await apiFetch<User[]>(
        `/users/search?q=${encodeURIComponent(q)}`
      );

      setResults(users);
    } catch (err) {
      console.error("User search failed:", err);

      setResults([]);
      setSearchError("Failed to search users");
    }
  };

  // Start a new conversation
  const startChat = async (userId: string) => {
    try {
      setStartChatError(null);

      const convo = await apiFetch<{
        conversation: {
          _id: string;
        };
      }>("/conversations/start", {
        method: "POST",
        body: { userId },
      });

      router.push(
        `/chat/${convo.conversation._id}`
      );

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    } catch (err) {
      console.error("Failed to start conversation:", err);

      setStartChatError(
        "Failed to start conversation"
      );
    }
  };

  return (
    <div className="w-72 bg-gray-950 border-r border-gray-800 flex flex-col text-white">

      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold text-lg">
          Chats
        </h2>

        {meLoading && (
          <p className="text-xs text-gray-500 mt-1">
            Loading...
          </p>
        )}

        {meError && (
          <p className="text-xs text-red-400 mt-1">
            Failed to load user
          </p>
        )}

        {me && (
          <p className="text-xs text-gray-400 mt-1">
            Logged in as {me.username}
          </p>
        )}

        <input
          value={query}
          onChange={(e) =>
            search(e.target.value)
          }
          placeholder="Search users..."
          className="mt-3 w-full bg-gray-800 text-sm text-white placeholder-gray-400 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {searchError && (
          <p className="text-xs text-red-400 mt-2">
            {searchError}
          </p>
        )}

        {startChatError && (
          <p className="text-xs text-red-400 mt-2">
            {startChatError}
          </p>
        )}
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

            <p className="text-sm">
              {u.username}
            </p>
          </div>
        ))}

        {/* Conversation loading */}
        {conversationsLoading && (
          <p className="text-sm text-gray-500 p-4">
            Loading conversations...
          </p>
        )}

        {/* Conversation error */}
        {conversationsError && (
          <p className="text-sm text-red-400 p-4">
            Failed to load conversations
          </p>
        )}

        {/* Conversations */}
        {!conversationsLoading &&
          !conversationsError &&
          conversations.map((c) => (
            <div
              key={c._id}
              onClick={() =>
                openConversation(c._id)
              }
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