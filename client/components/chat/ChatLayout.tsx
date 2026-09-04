"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket/socket";
import { useMe } from "@/hooks/useMe";

import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";

export default function ChatLayout() {
  const socket = getSocket();
  const { user, error: userError } = useMe();

  const [menuOpen, setMenuOpen] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const handleConnect = () => {
      console.log("Socket connected");
      setSocketError(null);
    };

    const handleConnectError = (err: Error) => {
      console.error("Socket connection failed:", err);
      setSocketError("Unable to connect to chat server");
    };

    const handleDisconnect = (reason: string) => {
      console.warn("Socket disconnected:", reason);

      // Don't show an error for an intentional disconnect
      if (reason !== "io client disconnect") {
        setSocketError("Chat connection lost");
      }
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user, socket]);

  if (userError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <p className="text-red-400">
            {userError}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-950 text-white overflow-hidden">

      {/* Socket connection error */}
      {socketError && (
        <div className="fixed top-0 left-0 right-0 z-100 bg-red-600 text-white text-sm text-center py-2">
          {socketError}
        </div>
      )}

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-gray-950 border-r border-gray-800 z-50 transform transition-transform duration-300
        ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } md:hidden`}
      >
        <Sidebar />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 border-r border-gray-800">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 bg-gray-900">

        <ChatHeader
          openMenu={() => setMenuOpen(true)}
        />

        <div className="flex-1 overflow-y-auto">
          <ChatMessages />
        </div>

        <div className="border-t border-gray-800">
          <MessageInput />
        </div>

      </div>

    </div>
  );
}