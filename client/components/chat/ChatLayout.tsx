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
  const { user } = useMe();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    socket.connect();
  }, [user, socket]);

  return (
    <div className="h-screen flex bg-gray-950 text-white overflow-hidden">

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
        ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >
        <Sidebar />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 border-r border-gray-800">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 bg-gray-900">

        <ChatHeader openMenu={() => setMenuOpen(true)} />

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