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
          setError("Your session has expired. Please log in again.");
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
    const isUnauthorized =
      error === "Your session has expired. Please log in again.";

    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-white px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 9v3.5m0 3h.01M10.3 3.8l-7.1 12.3A2 2 0 005 19h14a2 2 0 001.8-2.9L13.7 3.8a2 2 0 00-3.4 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white">
            {isUnauthorized
              ? "Session Expired"
              : "Oops! Something went wrong"}
          </h2>

          <p className="mt-2 text-gray-400">
            {error}
          </p>

          {isUnauthorized && (
            <button
              onClick={() => router.replace("/login")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-600/30 active:scale-95"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Login
            </button>
          )}

          {!isUnauthorized && (
            <button
              onClick={() => router.push("/home")}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition-all hover:bg-blue-500 active:scale-95"
            >
              Back to Chats
            </button>
          )}
        </div>
      </div>
    );
  }

  return <ChatLayout />;
}