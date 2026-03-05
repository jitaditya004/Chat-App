import { Server } from "socket.io";

export function registerSocketHandlers(io: Server) {
  io.on("connection", socket => {
    socket.on("join-conversation", conversationId => {
      socket.join(conversationId);
    });

    socket.on("send-message", data => {
      io.to(data.conversationId).emit("new-message", data);
    });
  });
}