import { Server, Socket } from "socket.io"
import { MessageModel } from "../models/message.model"
import { ConversationModel } from "../models/conversation.model"

const onlineUsers = new Map<string, string>();

export function registerSocketHandlers(io: Server, socket: Socket) {

  socket.onAny((event, ...args) => {
    console.log("📡 SOCKET EVENT:", event, args);
  });

  console.log("user connected", socket.id)

  socket.on("join-conversation", (conversationId: string) => {
    socket.join(conversationId)
  })


  

    socket.on("user-online", (userId: string) => {

      onlineUsers.set(userId, socket.id);

      io.emit("online-users", Array.from(onlineUsers.keys()));

    });

    socket.on("disconnect", () => {

      for (const [userId, id] of onlineUsers.entries()) {

        if (id === socket.id) {
          onlineUsers.delete(userId);
        }

      }

      io.emit("online-users", Array.from(onlineUsers.keys()));

      console.log("user disconnected", socket.id)

    });

  

  socket.on("send-message", async (payload, ack) => {

    const msg = await MessageModel.create({
      conversationId: payload.conversationId,
      senderId: payload.senderId,
      text: payload.text
    });

    const conversation = await ConversationModel.findById(
      payload.conversationId
    );

    if (!conversation) return;

    const otherUser = conversation.participants.find(
      (p) => p.toString() !== payload.senderId
    );

    if (otherUser) {
      const otherId = otherUser.toString();
      const current = conversation.unreadCount.get(otherId) ?? 0;
      conversation.unreadCount.set(otherId, current + 1);
    }

    conversation.lastMessage = payload.text;

    await conversation.save();

    io.to(payload.conversationId).emit("new-message", msg);
  });

    socket.on("stop-typing", ({ conversationId, userId }) => {

      socket.to(conversationId).emit("user-stop-typing", {
        userId
      });

    });
}