import { Server, Socket } from "socket.io"
import { MessageModel } from "../models/message.model"
import { ConversationModel } from "../models/conversation.model"

const onlineUsers = new Map<string, string>();

export function registerSocketHandlers(io: Server, socket: Socket) {

  console.log("user connected", socket.id)

  socket.on("join-conversation", (conversationId: string) => {
    socket.join(conversationId)
  })


  io.on("connection", (socket: Socket) => {

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

    });

  });

  socket.on(
    "send-message",
    async (
      payload: { conversationId: string; text: string; senderId: string },
      ack?: (response: { success: boolean }) => void
    ) => {

      const msg = await MessageModel.create({
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        text: payload.text
      })

      await ConversationModel.findByIdAndUpdate(
        payload.conversationId,
        { lastMessage: payload.text }
      )

      io.to(payload.conversationId).emit("new-message", msg)

      ack?.({ success: true })
    }
  )


  socket.on("typing", ({ conversationId, userId }) => {

  socket.to(conversationId).emit("user-typing", {
      userId
    });

  });

  socket.on("stop-typing", ({ conversationId, userId }) => {

    socket.to(conversationId).emit("user-stop-typing", {
      userId
    });

  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id)
  })
}