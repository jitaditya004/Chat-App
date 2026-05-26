"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import ChatLayout from "@/components/chat/ChatLayout";

export default function ChatPage() {

  const { id } = useParams<{ id: string }>();

  useEffect(() => {

    apiFetch(`/conversations/${id}/read`, {
      method: "POST"
    });

  }, [id]);

  return <ChatLayout />;

}

