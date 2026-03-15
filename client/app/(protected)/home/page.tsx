"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import Sidebar from "@/components/chat/Sidebar";

export default function HomePage() {
  const router = useRouter();

  const logout = async () => {
    await apiFetch("/auth/logout", {
      method: "POST"
    });

    router.replace("/login");
  };

  return (
    <div className="h-screen flex bg-gray-950 text-white">

      <div className="w-72 border-r border-gray-800">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col bg-gray-900">

        {/* Top bar */}
        <div className="h-14 flex items-center justify-end px-6 border-b border-gray-800">
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Center welcome area */}
        <div className="flex-1 flex items-center justify-center">

          <div className="text-center space-y-4">

            <div className="text-5xl">💬</div>

            <h2 className="text-2xl font-semibold">
              Welcome to Chat
            </h2>

            <p className="text-gray-400 max-w-sm">
              Select a conversation from the sidebar or search for someone to start chatting.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}