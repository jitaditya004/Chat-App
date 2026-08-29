import { Server, Socket } from "socket.io"
import { MessageModel } from "../models/message.model"
import { ConversationModel } from "../models/conversation.model"

const onlineUsers = new Map<string, string>();

export function registerSocketHandlers(io: Server, socket: Socket) {

  socket.onAny((event, ...args) => {
    console.log("📡 SOCKET EVENT:", event, args);
  });


  socket.on("join-conversation", (conversationId: string) => {
    socket.join(conversationId)
  })




  console.log("user connected", socket.id);

  const userId = socket.data.userId;

  onlineUsers.set(userId, socket.id);

  io.emit(
    "online-users",
    Array.from(onlineUsers.keys())
  );  

      

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
    try {
      const senderId = socket.data.userId;

      const conversation = await ConversationModel.findOne({
        _id: payload.conversationId,
        participants: senderId,
      });

      if (!conversation) {
        return ack({
          success: false,
          message: "Access denied",
        });
      }

      const msg = await MessageModel.create({
        conversationId: payload.conversationId,
        senderId,
        text: payload.text,
      });

      const otherUser = conversation.participants.find(
        (p) => p.toString() !== senderId
      );

      if (otherUser) {
        const otherId = otherUser.toString();

        const current =
          conversation.unreadCount.get(otherId) ?? 0;

        conversation.unreadCount.set(
          otherId,
          current + 1
        );
      }

      conversation.lastMessage = payload.text;

      await conversation.save();

      io.to(payload.conversationId).emit(
        "new-message",
        msg
      );

      ack({
        success: true,
        message: msg,
      });
    } catch (error) {
      console.error("send-message error:", error);

      ack({
        success: false,
        message: "Failed to send message",
      });
    }
  });





  socket.on("stop-typing", ({ conversationId}) => {
    const userId = socket.data.userId;

    socket.to(conversationId).emit("user-stop-typing", {
      userId
    });

  });
}