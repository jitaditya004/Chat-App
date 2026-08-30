"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import ChatLayout from "@/components/chat/ChatLayout";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();

  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!id) return;

  //   async function markAsRead() {
  //     try {
  //       setError(null);

  //       await apiFetch(`/conversations/${id}/read`, {
  //         method: "POST",
  //       });
  //     } catch (err) {
  //       console.error("Failed to mark conversation as read:", err);

  //       setError("Failed to mark conversation as read");
  //     }
  //   }

  //   markAsRead();
  // }, [id]);

  return (
    <>
      {error && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-sm text-center py-2">
          {error}
        </div>
      )}

      <ChatLayout />
    </>
  );
}