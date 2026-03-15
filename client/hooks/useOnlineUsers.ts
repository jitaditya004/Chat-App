import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket/socket";

export function useOnlineUsers() {

  const [onlineUsers, setOnlineUsers] =
    useState<string[]>([]);

  const socket = getSocket();

  useEffect(() => {

    socket.on("online-users", (users: string[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online-users");
    };

  }, [socket]);

  return onlineUsers;

}