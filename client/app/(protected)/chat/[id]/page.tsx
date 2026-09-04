"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import ChatLayout from "@/components/chat/ChatLayout";

type Conversation = {
  _id: string;
  otherUser: {
    _id: string;
    username: string;
  };
};

type ApiError = {
  status?: number;
  message?: string;
};

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function checkConversation() {
      try {
        setLoading(true);
        setError(null);

        await apiFetch<Conversation>(
          `/conversations/${id}`
        );

        setLoading(false);
      } catch (err: unknown) {
        console.error(
          "Failed to access conversation:",
          err
        );

        setLoading(false);

        const apiError = err as ApiError;

        if (apiError.status === 401) {
          router.replace("/login");
          return;
        }

        if (apiError.status === 403) {
          setError(
            "You are not authorized to access this conversation."
          );
          return;
        }

        if (apiError.status === 404) {
          setError("Conversation not found.");
          return;
        }

        setError("Unable to load conversation.");
      }
    }

    checkConversation();
  }, [id, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-gray-400">
          Loading conversation...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold">
            {error}
          </p>

          <button
            onClick={() => router.push("/chat")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return <ChatLayout />;
}